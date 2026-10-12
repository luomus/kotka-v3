import { JSONSchema4 } from 'json-schema';
import { Injectable } from '@nestjs/common';
import { LajiApiService, LajiStoreService, OldKotkaDataService } from '@kotka/api/services';
import { CacheService, MultiSetEntry } from '@kotka/api/cache';
import { Collection, Dataset, Organization, Person, specimenIndices } from '@kotka/shared/models';
import { lastValueFrom, map } from 'rxjs';
import { PerStoreTtl } from 'cacheable';
import { specimenConfig } from '../extractor/config/specimen.config';
import { identificationConfig } from '../extractor/config/identification.config';
import { typeSpecimenConfig } from '../extractor/config/type-specimen.config';
import { sampleConfig } from '../extractor/config/sample.config';

const EXTRACTOR_TTL: PerStoreTtl = { primary:  '10m', secondary: '24h' };
const KEY_FORM_ROOT = 'extractor_schema';
const KEY_FORM_ENUM_ROOT = `${KEY_FORM_ROOT}_enum`;
const KEY_FORM_FIELD_ROOT = `${KEY_FORM_ROOT}_fields`;
const KEY_ALT_ROOT = 'extractor_alt';
const KEY_DATASET_ROOT = 'extractor_dataset';
const KEY_ORGANIZATION_ROOT = 'extractor_organization';
const KEY_COLLECTION_ROOT = 'extractor_collection';

const extratedLevels = {
  'document': 'document',
  'gatherings': 'gathering',
  'units': 'unit',
  'samples': 'sample',
  'identifications': 'identification',
  'typeSpecimens': 'typespecimen',
  'preparations': 'preparation',
  'measurement': 'measurement',
};

const levelConfigs = {
  document: specimenConfig,
  gathering: specimenConfig,
  unit: specimenConfig,
  measurement: specimenConfig,
  sample: sampleConfig,
  identification: identificationConfig,
  typespecimen: typeSpecimenConfig,
}

interface CollectionTreeNode {
  id: string;
  collectionName: string;
  collectionTree: string[];
  parent?: string;
}

@Injectable()
export class ExtractorFieldMappingService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly storeService: LajiStoreService,
    private readonly lajiApiService: LajiApiService,
    private readonly oldKotkaDataService: OldKotkaDataService,
  ) {}

  normalizeClassName(className: string) {
    const pos = className.lastIndexOf('.');

    if (pos !== -1) {
      className = className.substring(pos + 1);
    }

    return className.replace(/(Class|Object)$/, '');
  }

  async intLabelCaches() {
    await this.cacheService.setValueWithFunc(KEY_DATASET_ROOT, async () => {
      return await this.initDatasets();
    }, EXTRACTOR_TTL, true);

    await this.cacheService.setValueWithFunc(KEY_ORGANIZATION_ROOT, async () => {
      return await this.initOrganizations();
    }, EXTRACTOR_TTL, true);

    await this.cacheService.setValueWithFunc(KEY_COLLECTION_ROOT, async () => {
      return await this.initCollectionTree();
    }, EXTRACTOR_TTL, true);

    await this.cacheService.setValueWithFunc(KEY_FORM_ROOT, async () => {
      return await this.initFormMappings();
    }, EXTRACTOR_TTL, true);
  }

  async initOrganizations() {
    const organizationNameLookup: MultiSetEntry<string> = {};

    const data = await lastValueFrom(
      this.storeService.getAll<Pick<Organization, 'id' | 'fullName'>>('organization', { page_size: 5000, fields: 'id,fullName' })
        .pipe(map(res => res.data.member)
      )
    );

    data.forEach(organization => {
      organizationNameLookup[`${KEY_ORGANIZATION_ROOT}_${organization.id!}`] = organization.fullName!.en!;
    });

    return organizationNameLookup;
  }

  async getOrganizationLabel(key: string) {
    const name = await this.cacheService.getValueWithMultiSet<string>(
      `${KEY_ORGANIZATION_ROOT}_${key}`,
      KEY_ORGANIZATION_ROOT,
      EXTRACTOR_TTL,
      async () => {
        return await this.initOrganizations();
      }
    );

    if (!name) {
      console.warn(`ElasticExtract: organization ${key} not found, using ${key} as fallback name.`);
    }

    return name || key;
  }

  async initDatasets() {
    const datasetNameLookup: MultiSetEntry<string> = {};

    const data = await lastValueFrom(
      this.storeService.getAll<Pick<Dataset, 'id' | 'datasetName'>>('dataset', { page_size: 5000, fields: 'id,datasetName' })
        .pipe(map(res => res.data.member)
      )
    );

    data.forEach(dataset => {
      datasetNameLookup[`${KEY_DATASET_ROOT}_${dataset.id!}`] = dataset.datasetName.en!;
    });

    return datasetNameLookup;
  }

  async getDatasetLabel(key: string) {
    const name = await this.cacheService.getValueWithMultiSet<string>(
      `${KEY_DATASET_ROOT}_${key}`,
      KEY_DATASET_ROOT,
      EXTRACTOR_TTL,
      async () => {
        return await this.initDatasets();
      }
    );

    if (!name) {
      console.warn(`ElasticExtract: dataset ${key} not found, using ${key} as fallback name.`);
    }

    return name || key;
  }

  async initCollectionTree() {
    const collections = await this.oldKotkaDataService.getAllCollections();

    const roots: Collection[] = [];
    const childLookup: { [key: string]: Collection[] } = {};
    collections.forEach((collection) => {
      if (!collection.isPartOf) {
        roots.push(collection);
      } else {
        if (!childLookup[collection.isPartOf]) {
          childLookup[collection.isPartOf] = [];
        }
        childLookup[collection.isPartOf].push(collection);
      }
    });

    const treeLookup: MultiSetEntry<CollectionTreeNode> = {};

    roots.forEach((root) => {
      this.parseCollectionTree(root, childLookup, treeLookup);
    });

    Object.keys(treeLookup).forEach(key => {
      treeLookup[`${KEY_COLLECTION_ROOT}_${key}`] = treeLookup[key];
      delete treeLookup[key];
    });

    return treeLookup;
  }

  parseCollectionTree(node: Collection, childLookup: { [key: string]: Collection[] }, treeLookup: MultiSetEntry<CollectionTreeNode>) {
    if (!node.isPartOf) {
      treeLookup[node.id!] = {
        id: node.id!,
        collectionName: node.collectionName.en!,
        collectionTree: [node.id!] };
    } else {
      const parent = treeLookup[node.isPartOf!];

      treeLookup[node.id!] = {
        id: node.id!,
        parent: node.isPartOf!,
        collectionName: node.collectionName.en!,
        collectionTree: [node.id!, ...parent.collectionTree]
      };
    }

    childLookup[node.id!]?.forEach((collection) => {
      this.parseCollectionTree(collection, childLookup, treeLookup);
    });
  }

  async getCollection(key: string): Promise<CollectionTreeNode | undefined> {
    const collection = await this.cacheService.getValueWithMultiSet<CollectionTreeNode>(
      `${KEY_COLLECTION_ROOT}_${key}`,
      KEY_COLLECTION_ROOT,
      EXTRACTOR_TTL,
      async () => {
        return await this.initCollectionTree();
      }
    );

    if (!collection) {
      console.warn(`ElasticExtract: collection ${key} not found, using ${key} as fallback.`);
    }

    return collection;
  }

  async getCollectionTree(key: string) {
    const collection = await this.getCollection(key);

    if (!collection) {
      return undefined;
    }

    return collection.collectionTree;
  }

  async getCollectionLabel(key: string) {
    const collection = await this.getCollection(key);

    if (!collection) {
      return key;
    }

    return collection.collectionName;
  }

  async initFormMappings() {
    const schema = await lastValueFrom(this.lajiApiService.get<{schema: JSONSchema4}>('forms/MHL.1158').pipe(map(res => res.data?.schema)));

    const schemaMappings = {} as { [key: string]: { [value: string]: string }};

    this.parseFormMappings('document', schema, schemaMappings);

    return schemaMappings;
  }

  async parseFormMappings(parent: string, schema: JSONSchema4, schemaEnums: { [key: string]: { [value: string]: string | {[key: string]: string}}}) {
    if (parent === 'document') {
      this.mapHardCodedFields(schemaEnums);
    }

    Object.keys(schema.properties!).forEach((property) => {
      const val: JSONSchema4 = schema.properties[property];

      this.mapLabels(parent, property, val, schemaEnums);

      const items = val.items as JSONSchema4 | undefined;
      if (val.type === 'string' && val.oneOf) {
        this.mapEnums(property, val.oneOf, schemaEnums);
      } else if (
        val.type === 'array' &&
        items?.type === 'string' &&
        items?.oneOf) {
          this.mapEnums(property, items.oneOf, schemaEnums);
      } else if (
        val.type === 'array' &&
        items?.properties &&
        extratedLevels[property]
      ) {
        this.parseFormMappings(`${parent}.${extratedLevels[property] || property}`, val.items as JSONSchema4, schemaEnums);
      } else if (
        val.type === 'object' &&
        val.properties &&
        extratedLevels[property])
      {
        this.parseFormMappings(`${parent}.${extratedLevels[property] || property}`, val, schemaEnums);
      }
    });
  }

  mapHardCodedFields(schemaEnums: { [key: string]: { [value: string]: string | {[key: string]: string}}}) {
    if (!schemaEnums[KEY_FORM_FIELD_ROOT]) {
      schemaEnums[KEY_FORM_FIELD_ROOT] = {};
    }

    specimenIndices.forEach((index) => {
      const { hardCodedFields, autocompleteFields } = levelConfigs[index.replace('specimen_', '')];

      Object.keys(hardCodedFields).forEach((key) => {
        schemaEnums[KEY_FORM_FIELD_ROOT][key] = {
          ...hardCodedFields[key],
          hasAutocomplete: autocompleteFields[key] ?? false,
      };
      });
    });
  }

  mapLabels(path: string, key: string, property: JSONSchema4, enums: { [key: string]: {[value: string]: string | {[key: string]: string} }}) {
    if (!property.title) {
      return;
    }

    let level = path.split('.').slice(-1)[0];

    const { autocompleteFields, remove } = levelConfigs[level] || {};

    if (remove?.includes(key)) {
      return;
    }

    if (path.includes('sample')) {
        if (path.includes('measurement')) return;

      key = key.startsWith('sample') ? key : `sample${key.charAt(0).toUpperCase() + key.slice(1)}`;
    }

    if (!enums[KEY_FORM_FIELD_ROOT]) {
      enums[KEY_FORM_FIELD_ROOT] = {}
    }

    const hardCodedField = levelConfigs[level]?.hardCodedFields?.[key];

    enums[KEY_FORM_FIELD_ROOT][key] = {
      label: hardCodedField?.label ?? property.title,
      level: level,
      hasAutocomplete: autocompleteFields?.includes(key) ?? false,
    };
  }

  mapEnums(property: string, oneOf: JSONSchema4[], enums) {
    enums[`${KEY_FORM_ENUM_ROOT}_${property}`] = Object.fromEntries(oneOf.map((e) => [e.const, e.title]));
  }

  async getFormEnum(key: string, field: string) {
    const values = await this.cacheService.getValueWithMultiSet<{ [value: string]: string }>(
      `${KEY_FORM_ENUM_ROOT}_${field}`,
      KEY_FORM_ROOT,
      EXTRACTOR_TTL,
      async () => {
        return await this.initFormMappings();
      }
    );

    if (values?.[key]) {
      return values[key];
    }

    if (!values) {
      console.warn(`ElasticExtract: field ${field} not found in schema enums`);
      return;
    }

    if (!values[field]) {
      console.warn(`ElasticExtract: value ${key} not found in schema enums for field ${field}, using ${key} as fallback.`);
    }

    return key;
  }

  async getFormFields() {
    const fields = await this.cacheService.getValueWithMultiSet<{ [key: string]: any }>(
      KEY_FORM_FIELD_ROOT,
      KEY_FORM_ROOT,
      EXTRACTOR_TTL,
      async () => {
        return await this.initFormMappings();
      }
    );

    return fields;
  }

  async getAltEnum(key: string, field: string) {
    const values = await this.cacheService.getValue<{ [value: string]: string }>(
      `${KEY_ALT_ROOT}_${field}`,
      EXTRACTOR_TTL,
      async () => {
        return await this.getMetadataAlt(field);
      }
    );

    if (values?.[key]) {
      return values[key];
    }


    if (!values[field]) {
      console.warn(`ElasticExtract: value ${key} not found in metadata enums for alt ${field}`);
    }

    return key;
  }

  async getMetadataAlt(field: string) {
    return await lastValueFrom(this.lajiApiService.get<{ results: { id: string, value: string }[] }>(`metadata/alts/${field}`).pipe(
      map(res => res.data),
      map(res => res.results),
      map(res => {
        const map: Record<string, string> = {};
        res.forEach(entry => map[entry.id] = entry.value);

        return map;
      })
    ));
  }

  async getUser(userId: string) {
    try {
      const fullName = await lastValueFrom(this.lajiApiService.get<Pick<Person, 'id' | 'fullName'>>(`person/${userId}`).pipe(map(res => res.data?.fullName)));

    if (!fullName) {
      return userId;
    }

    const splitIdx = fullName.indexOf(' ');
    const firstName = fullName.substring(0, splitIdx);
    const lastName = fullName.substring(splitIdx + 1);

    return lastName + ', ' + firstName;
    } catch (err) {
      console.warn(`ElasticExtract: user ${userId} not found`);
      return userId;
    }
  }
  async getUserLabel(userId: string) {
    const label = await this.cacheService.getValue<string>(
      `extractor_user_${userId}`,
      EXTRACTOR_TTL,
      async () => {
        return await this.getUser(userId);
      }
    );

    return label;
  }

  async getFieldValueMapping(value: string, field: string) {
    switch (field) {
      case 'creator':
      case 'editor':
        return await this.getUserLabel(value);
      case 'acquiredFromOrganization':
      case 'owner':
        return await this.getOrganizationLabel(value);
      case 'datasetID':
        return await this.getDatasetLabel(value);
      case 'collectionID':
        return await this.getCollectionLabel(value);
      case 'endangeredStatus':
        return await this.getAltEnum(value, 'MX.iucnStatuses');
      default:
        return await this.getFormEnum(value, field);
    }
  }
}
