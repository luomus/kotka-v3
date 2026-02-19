/*
https://docs.nestjs.com/providers#services
*/

import { LajiApiService, LajiStoreService, AbschService } from '@kotka/api/services';
import { CoordinateLocationResponse, KotkaDocumentObjectFullType, SpecimenDataType, specimenDataTypeToNameMap } from '@kotka/shared/models';
import { Dataset, Document } from '@luomus/laji-schema';
import { Injectable } from '@nestjs/common';
import { get } from 'lodash';
import { lastValueFrom, map } from 'rxjs';
import { NamespaceData, NamespaceService } from './namespace.service';
import { acceptedPrefixes, convertCoordinatesToWGS84, defaultPrefix } from '@kotka/shared/utils';
import { GeometryCollection } from 'geojson';
import { JSONPath } from 'jsonpath-plus';
@Injectable()
export class ValidationService {
  constructor(
    private readonly lajiApiService: LajiApiService,
    private readonly lajiStoreService: LajiStoreService,
    private readonly abschService: AbschService,
    private readonly namespaceService: NamespaceService,
  ) { }

  async remoteValidate(query: any, options: any) {
    let error = {};
    switch (query.validator) {
      case 'kotkaDatasetNameUnique':
        error = await this.validateDatasetNameUnique(JSON.parse(options.body), query.field);
        break;
      case 'kotkaIRCCNumber':
        error = await this.validateIRCCNumber(JSON.parse(options.body), query.field);
        break;
      case 'kotkaAllowedNamespace':
        error = await this.validateAllowedNamespace(JSON.parse(options.body), query.field);
        break;
      case 'kotkaMuncipalityCoordinates':
        error = await this.validateCoordinateMunicipality(JSON.parse(options.body), query.field);
        break;
      case 'kotkaSequenceUnique':
        error = await this.validateDocumentSequenceIdUnique(JSON.parse(options.body), query);
        break;
      default:
        try {
          await lastValueFrom(this.lajiApiService.post('documents/validate', JSON.parse(options.body), query));
        } catch (e: any) {
          if (e.response?.data?.errorCode === 'VALIDATION_EXCEPTION') {
            error = e.response.data;
          } else {
            throw e;
          }
        }
    }

    return error;
  }

  private clearField(field: string) {
    if (field[0] === '.') {
      return field.slice(1);
    }

    return field;
  }

  async validateAllowedNamespace(data: Record<string, any>, field: string) {
    const fieldName = this.clearField(field);

    const namespaces = await this.namespaceService.getNamespaces();
    let namespaceID = get(data, fieldName);
    let prefix;

    if (namespaceID.includes(':')) {
      [ prefix, namespaceID ] = namespaceID.split(':');
    }

    const datatype = data.datatype;

    const namespaceError = this.validateNamespaceForType(namespaceID, datatype, namespaces);
    if (namespaceError) {
      return this.getError(field, namespaceError);
    }

    if (prefix) {
      const prefixError = this.validatePrefixForNamespace(prefix, namespaceID, namespaces);
      if (prefixError) {
        return this.getError(field, prefixError);
      }
    }

    return {};
  }

  validateNamespaceForType(namespaceID: string, datatype: SpecimenDataType, namespaces: NamespaceData[]) {
    const namespace = namespaces.find(namespace => namespace.namespace_id === namespaceID);

    if (!namespace) {
      return `Unknown namespace "${namespaceID}".`;
    }

    const namespaceType = namespace.namespace_type;
    const shortDatatype = specimenDataTypeToNameMap[datatype];

    if (!(namespaceType === '' || namespaceType === 'all' || namespaceType === shortDatatype)) {
      return `Namespace "${namespaceID}" is not allowed for specimen of type "${datatype}".`;
    }
  }

  validatePrefixForNamespace(prefix: string, namespaceID: string, namespaces: NamespaceData[]) {
      const namespace = namespaces.find(namespace => namespace.namespace_id === namespaceID);

      if (!acceptedPrefixes.includes(prefix)) {
        return `Unknown prefix "${prefix}" not accepted.`;
      }

      if (!namespace) {
        return `Unkonwn namespace ${namespaceID}`
      }

      if (
        !(namespace.qname_prefix === 'all' ||
        (prefix === defaultPrefix && namespace.qname_prefix === '') ||
        prefix === namespace.qname_prefix)
      ) {
        return `Unacceptable prefix in namespace, has "${prefix}" but accepts only "${namespace.qname_prefix || defaultPrefix}".`;
      }
  }

  async validateDatasetNameUnique(data: Document, field: string) {
    const datasetNameField = 'datasetName' + field;
    const datasetName = get(data, datasetNameField);
    const members: Dataset[] = await lastValueFrom(this.lajiStoreService.search<Dataset>(KotkaDocumentObjectFullType.dataset, { query: { match: { [datasetNameField]: datasetName }}}).pipe(map(res => res.data?.member)));

    if (members.length !== 0 && !(members.length === 1 && members[0].id && members[0].id === data.id)) {
      return this.getError(datasetNameField, 'Dataset name must be unique.');
    }

    return {};
  }

  async validateIRCCNumber(data: Record<string, any>, field: string) {
    if (field[0] === '.') {
      field = field.slice(1);
    }
    const value = get(data, field);
    if (!value) {
      return {};
    }

    try {
      const isValid = await this.abschService.checkIRCCNumberIsValid(value);
      if (!isValid) {
        return this.getError(field, 'Invalid IRCC number "%{value}" given.', value);
      }
    } catch (e) {
      return this.getError(field, 'ABSCH API didn\'t respond in time.');
    }

    return {};
  }

  async validateCoordinateMunicipality(data: Document, field: string) {
    const value: string | undefined = data.gatherings[0].municipality;
    if (!value) {
      return {};
    }

    const coordinateSystem = data.gatherings[0].coordinateSystem!;
    const latitude = Number(data.gatherings[0].latitude!);
    const longitude = Number(data.gatherings[0].longitude!);

    const coordinates = convertCoordinatesToWGS84(latitude, longitude, coordinateSystem);

    if (!coordinates) {
      return 'Error converting coordinates to WGS84 for validation.'
    }

    const geometry: GeometryCollection = {
      type: 'GeometryCollection',
      geometries: [{
        type: 'Point',
        coordinates: coordinates.reverse()
      }]
    };

    const localities = await lastValueFrom(this.lajiApiService.post<CoordinateLocationResponse>('coordinates/location', geometry, { lang: 'multi' }).pipe(map(res => res.data)));

    if (!localities.results.length) {
      return {};
    }

    let matchFound = false;
    const nonMatches: string[] = [];

    localities.results.forEach(locality => {
      if (!locality.types.includes('municipality')) {
        return;
      }

      locality.address_components.forEach(component => {
        if (!component.types.includes('municipality')) {
          return;
        }

        Object.keys(component.short_name).forEach(lang => {
          if(component.short_name[lang as keyof typeof component.short_name]?.toLowerCase() === value.toLowerCase()) {
            matchFound = true;
          }
        });

        if (!matchFound) {
          nonMatches.push(component.short_name['fi']!);
        }
      });
    });

    if (matchFound || !nonMatches) {
      return {};
    }

    return this.getError(field, `Coordinates do not match municipality, has ${value} but coordinates correspond to ${nonMatches.join(', ')}`);
  }

  async validateDocumentSequenceIdUnique(data: any, query: any) {
    const field = query.fullField || query.field;
    const fieldPath = this.clearField(query.field);
    const fullFieldPath = this.clearField(field);
    const fullFieldName = '.' + field.split('.').at(-1);
    const storePath = this.getStoreSearchPath(field);

    const parent = JSONPath({ path: fullFieldPath, json: data, resultType: 'parent' })[0];
    let value = parent[fieldPath];
    delete parent[fieldPath];

    if (!Array.isArray(value)) {
      value = [ value ];
    }

    const results = JSONPath({ path: this.getDocumentInternalSearchPath(field), json: data });

    const selfDuplicateIDs: string[] = [];

    results.forEach((result: string | string[]) => {
      if (Array.isArray(result)) {
        result.forEach(val => {
          if (value.includes(val)) {
            selfDuplicateIDs.push(val);
          }
        });
      } else {
        if (value.includes(result)) {
          selfDuplicateIDs.push(result);
        }
      }
    });

    if (selfDuplicateIDs.length) {
      return this.getError(fullFieldName, `Duplicate values found within submitted document, found multiple of ${selfDuplicateIDs.join(', ')}`);
    }

    const searchBody = { query: { bool: { should: [{ terms: { [storePath]: value }}]}}};

    const docs = (await lastValueFrom(this.lajiStoreService.search<Document>(KotkaDocumentObjectFullType.document, searchBody))).data;

    if (!docs.member.length || (data.id && docs.member.length === 1 && docs.member[0].id === data.id)) {
      return {};
    }

    const duplicateIDs: Record<string, string[]> = {};

    docs.member.forEach(document => {
      if (document.id === data.id) {
        return;
      }

      const id = document.id!;

      const results = JSONPath({ path: this.getDocumentInternalSearchPath(fullFieldPath), json: document });
      duplicateIDs[id] = [];

      results.forEach((result: string | string[]) => {
        if (Array.isArray(result)) {
          result.forEach(val => {
            if (value.includes(val)) {
              duplicateIDs[id].push(val);
            }
          });
        } else if(value.includes(result)) {
          duplicateIDs[id].push(result)
        }
      });
    });

    return this.getError(fullFieldName, `Found duplicates in other documents, found in ${this.getUniqueIdSequenceError(duplicateIDs).join(', ')}`);
  }

  private getUniqueIdSequenceError(values: Record<string, string[]>) {
    return Object.keys(values).map(value => {
      return `${value}: ${values[value].join(', ')}`;
    });
  }


  private getError(field: string, errorMsg: string, value?: any) {
    return { errorCode: 'VALIDATION_EXCEPTION', details: { [field]: [errorMsg.replace('%{value}', value)] }};
  }

  private getStoreSearchPath(path: string) {
    path = this.clearField(path);
    return path.replace(/\[\d+\]/g, '');
  }

  private getDocumentInternalSearchPath(path: string) {
    path = this.clearField(path);
    return path.replace(/\[\d+\]/g, '[*]');
  }
}
