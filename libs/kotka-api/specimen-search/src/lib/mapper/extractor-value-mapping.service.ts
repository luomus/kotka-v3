import { JSONSchema4 } from 'json-schema';
import { Injectable } from '@nestjs/common';
import { LajiApiService, LajiStoreService, OldKotkaDataService } from '@kotka/api/services';
import { CacheService, MultiSetEntry } from 'libs/kotka-api/cache/src';
import { Collection, Dataset, Organization, Person } from '@kotka/shared/models';
import { lastValueFrom, map } from 'rxjs';
import { PerStoreTtl } from 'cacheable';

const EXTRACTOR_TTL: PerStoreTtl = { primary:  '10m', secondary: '24h' };
const EXTRACTOR_ENUM_ROOT = 'extractor_enum';
const EXTRACTOR_DATASET_ROOT = 'extractor_dataset';
const EXTRACTOR_ORGANIZATION_ROOT = 'extractor_organization';
const EXTRACTOR_COLLECTION_ROOT = 'extractor_collection';

const extratedLevels = ['MY.document', 'MY.gathering', 'MY.unit', 'MF.sample', 'MY.identification', 'MY.typeSpecimen', 'MF.preparationClass'] as const;

interface CollectionTreeNode {
  id: string;
  collectionName: string;
  collectionTree: string[];
  parent?: string;
}

@Injectable()
export class ExtractorValueMappingService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly storeService: LajiStoreService,
    private readonly lajiApiService: LajiApiService,
    private readonly oldKotkaDataService: OldKotkaDataService
  ) {}

  normalizeClassName(className: string) {
    const pos = className.lastIndexOf('.');

    if (pos !== -1) {
      className = className.substring(pos + 1);
    }

    return className.replace(/(Class|Object)$/, '');
  }

  async intLabelCaches() {
    await this.cacheService.setValue(EXTRACTOR_DATASET_ROOT, async () => {
      return await this.initDatasets();
    }, EXTRACTOR_TTL, true);

    await this.cacheService.setValue(EXTRACTOR_ORGANIZATION_ROOT, async () => {
      return await this.initOrganizations();
    }, EXTRACTOR_TTL, true);

    await this.cacheService.setValue(EXTRACTOR_COLLECTION_ROOT, async () => {
      return await this.initCollectionTree();
    }, EXTRACTOR_TTL, true);

    await this.cacheService.setValue(EXTRACTOR_ENUM_ROOT, async () => {
      return await this.initSchemaEnums();
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
      organizationNameLookup[organization.id!] = organization.fullName!.en!;
    });

    return organizationNameLookup;
  }

  async getOrganizationLabel(key: string) {
    const name = await this.cacheService.getValueWithMultiSet<string>(
      EXTRACTOR_ORGANIZATION_ROOT,
      key,
      EXTRACTOR_TTL,
      async () => {
        return await this.initOrganizations();
      }
    );

    if (!name) {
      console.warn(`ElasticExtract: organization ${key} not found`);
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
      datasetNameLookup[dataset.id!] = dataset.datasetName.en!;
    });

    return datasetNameLookup;
  }

  async getDatasetLabel(key: string) {
    const name = await this.cacheService.getValueWithMultiSet<string>(
      EXTRACTOR_DATASET_ROOT,
      key,
      EXTRACTOR_TTL,
      async () => {
        return await this.initDatasets();
      }
    );

    if (!name) {
      console.warn(`ElasticExtract: dataset ${key} not found`);
    }

    return name || key;
  }

  async initCollectionTree() {
    const collections = await this.oldKotkaDataService.getAllCollections()

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

      childLookup[node.id!]?.forEach((collection) => {
          this.parseCollectionTree(collection, childLookup, treeLookup);
      });
    }
  }

  async getCollection(key: string): Promise<CollectionTreeNode | undefined> {
    const collection = await this.cacheService.getValueWithMultiSet<CollectionTreeNode>(
      EXTRACTOR_COLLECTION_ROOT,
      key,
      EXTRACTOR_TTL,
      async () => {
        return await this.initCollectionTree();
      }
    );

    if (!collection) {
      console.warn(`ElasticExtract: collection ${key} not found`);
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

  async initSchemaEnums() {
    const schema = await lastValueFrom(this.storeService.getJsonSchema('MY.document').pipe(map(res => res.data)));

    const schemaEnums = {} as { [field: string]: { [value: string]: string }};

    this.parseSchemaEnums(schema, schemaEnums);

    return schemaEnums;
  }

  async parseSchemaEnums(schema: JSONSchema4, schemaEnums: { [key: string]: {[value: string]: string }}, parent = 'document') {
    if (extratedLevels.includes(schema.subject) && schema.properties) {

      if (!schema.properties) {
        return;
      }

      Object.keys(schema.properties!).forEach((property) => {
        const val: JSONSchema4 = schema.properties![property];
        const items = val.items as JSONSchema4 | undefined;
        if (val.enum && val.enumNames) {
          this.mapEnums(property, val.enum as string[], val.enumNames as string[], schemaEnums);
        } else if (
          val.type === 'array' &&
          items?.subject &&
          extratedLevels.includes(items?.subject)
        ) {
          this.parseSchemaEnums(val.items as JSONSchema4, schemaEnums, property);
        } else if (
          val.type === 'array' &&
          items?.enum &&
          items?.enumNames) {
            this.mapEnums(property, items.enum as string[], items.enumNames as string[], schemaEnums);
          }
      });
    }
  }

  mapEnums(property: string, enumValues: string[], enumNames: string[], schemaEnums: { [key: string]: {[value: string]: string }}) {
    schemaEnums[`${property}`] = Object.fromEntries(enumValues.map((value, index) => [value, enumNames[index]]));
  }

  async getSchemaEnum(key: string, field: string) {
    const values = await this.cacheService.getValueWithMultiSet<{ [value: string]: string }>(
      `${EXTRACTOR_ENUM_ROOT}`,
      field,
      EXTRACTOR_TTL,
      async () => {
        return await this.initSchemaEnums();
      }
    );

    if (values?.[key]) {
      return values[key];
    }

    if (!values) {
      console.warn(`ElasticExtract: field ${field} not found in schema enums`);
      return
    }

    if (!values[field]) {
      console.warn(`ElasticExtract: value ${key} not found in schema enums for field ${field}`);
    }

    return key;
  }

  async getAltEnum(key: string, field: string) {
    const values = await this.cacheService.getValue<{ [value: string]: string }>(
      `${EXTRACTOR_ENUM_ROOT}_${field}`,
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
        const map: Record<string, string> = {}
        res.forEach(entry => map[entry.id] = entry.value)

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

  async getValueMapping(value: string, field: string) {
    switch (field) {
      case 'creator':
      case 'editor':
        return await this.getUserLabel(value);
      case 'owner':
        return await this.getOrganizationLabel(value);
      case 'datasetID':
        return await this.getDatasetLabel(value);
      case 'collectionID':
        return await this.getCollectionLabel(value);
      case 'endangeredStatus':
        return await this.getAltEnum(value, 'MX.iucnStatuses');
      default:
        return await this.getSchemaEnum(value, field);
    }
  }
}
