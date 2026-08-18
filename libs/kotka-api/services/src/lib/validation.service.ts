/*
https://docs.nestjs.com/providers#services
*/
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import { AbschService } from './absch.service';
import { FormService } from './form.service';
import { LajiApiService } from './laji-api.service';
import { LajiStoreService } from './laji-store.service';
import { defaultNamespaceID, NamespaceData, NamespaceService } from './namespace.service';
import {
  ApiValidationError,
  CoordinateLocationResponse,
  KotkaObjectFullType,
  SpecimenDataType,
  specimenTypeToNameMap,
} from '@kotka/shared/models';
import { Dataset, Document, StoreObject } from '@luomus/laji-schema';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { acceptedPrefixes, defaultPrefix, JSONPathAllResponse, parseJSONPointer, parseStoreSearchPath } from '@kotka/shared/utils';
import { GeometryCollection } from 'geojson';
import { JSONPath } from 'jsonpath-plus';
import * as lajiValidate from '@luomus/laji-validate';
import Ajv from 'ajv';

@Injectable()
export class ValidationService {
  //@ts-ignore
  private readonly ajv: Ajv;

  constructor(
    private readonly lajiApiService: LajiApiService,
    private readonly lajiStoreService: LajiStoreService,
    private readonly abschService: AbschService,
    private readonly namespaceService: NamespaceService,
    private readonly formService: FormService
  ) {
    this.ajv = new Ajv({
      allErrors: true,
    });

    lajiValidate.extend(lajiValidate.validators.remote, {
      fetch: (path: any, query: any, options: any) => {
        return this.remoteValidate(query, options).then((data) => {
          if (!data) {
            return { status: 200 };
          } else {
            return { status: 422, json: async () => data };
          }
        });
      }
    });
  }

  async validate(data: StoreObject, type: KotkaObjectFullType, schemaOnly = false) {
    const form = await this.formService.getForm(type);

    const errors = {};

    if (form.schema && !this.ajv.validate(form.schema, data)) {
      this.ajv.errors!.map(error => {
        if (!errors[error.instancePath]) {
          errors[error.instancePath] = [];
        }
        let message = error.message;
        if (error.keyword === 'enum' && error.params && error.params.allowedValues) {
          message += ` '${error.params.allowedValues.join('\', \'')}.`;
        }
        errors[error.instancePath].push(message);
      });

      return errors;
    }

    if (form.validators && !schemaOnly) {
      try {
        await lajiValidate.async(data, form.validators);
      } catch (err) {
        Object.keys(err).map(key => {
          if (Array.isArray(err[key])) {
            if (typeof err[key][0] === 'string') {
              const path1 = key.startsWith('.') ? key : '.' + key;
              if (!errors[path1]) {
                errors[path1] = [];
              }
              errors[path1].push(...err[key]);
            } else if (typeof err[key][0] === 'object') {
              err[key].map(obj => {
                Object.keys(obj).map((path) => {
                  const path1 = path.startsWith('.') ? path : '.' + path;
                  if (!errors[path1]) {
                    errors[path1] = [];
                  }
                  errors[path1].push(...obj[path]);
                });
              });
            } else {
              console.error('Could not interpret the error message');
            }
          }
        });

        return errors;
      }
    }
  }

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
        error = await this.validateDocumentSequenceIdUnique(JSON.parse(options.body), query.field);
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

  async validateAllowedNamespace(data: Record<string, any>, field: string) {
    //TODO check both present or reject defult prefix.
    let namespaceID: string = parseJSONPointer(data, field);
    let prefix;

    if (namespaceID.includes(':')) {
      [prefix, namespaceID] = namespaceID.split(':');
    }

    if (namespaceID === defaultNamespaceID) {
      return getError(field, `Namespace ${defaultNamespaceID} is default and should not be used explicitly.`);
    }

    const datatype = data.datatype;

    const namespaces = await this.namespaceService.getNamespaces();

    const namespaceError = this.validateNamespaceForType(namespaceID, datatype, namespaces);
    if (namespaceError) {
      return getError(field, namespaceError);
    }

    if (prefix) {
      const prefixError = this.validatePrefixForNamespace(prefix, namespaceID, namespaces);
      if (prefixError) {
        return getError(field, prefixError);
      }
    }
  }

  validateNamespaceForType(namespaceID: string, datatype: SpecimenDataType, namespaces: NamespaceData[]) {
    const namespace = namespaces.find(namespace => namespace.namespace_id === namespaceID);

    if (!namespace) {
      return `Unknown namespace "${namespaceID}".`;
    }

    const namespaceType = namespace.namespace_type;
    const shortDatatype = specimenTypeToNameMap[datatype];

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
      return `Unkonwn namespace ${namespaceID}`;
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
    const datasetName: string | undefined = parseJSONPointer(data, field);
    const datasetNameField: string = parseStoreSearchPath(field);

    const members: Dataset[] = await lastValueFrom(this.lajiStoreService.search<Dataset>(KotkaObjectFullType.dataset, { query: { match: { [datasetNameField]: datasetName } } }).pipe(map(res => res.data?.member)));

    if (members.length !== 0 && !(members.length === 1 && members[0].id && members[0].id === data.id)) {
      return getError(field, 'Dataset name must be unique.');
    }
  }

  async validateIRCCNumber(data: Record<string, any>, field: string) {
    const value: string | undefined = parseJSONPointer(data, field);

    if (!value) {
      return;
    }

    try {
      const isValid = await this.abschService.checkIRCCNumberIsValid(value);
      if (!isValid) {
        return getError(field, 'Invalid IRCC number "%{value}" given.', value);
      }
    } catch (e) {
      return getError(field, 'ABSCH API didn\'t respond in time.');
    }
  }

  async validateCoordinateMunicipality(data: Document, field: string) {
    const value: string | undefined = parseJSONPointer(data, field);
    if (!value) {
      return;
    }

    const wgs84Latitude = data.gatherings[0].wgs84Latitude;
    const wgs84Longitude = data.gatherings[0].wgs84Longitude;

    if ((!wgs84Latitude && wgs84Longitude) || (wgs84Latitude && !wgs84Longitude)) {
      return getError(field, 'Only one of the coordinates found.');
    }

    const coordinates = [Number(wgs84Latitude), Number(wgs84Longitude)];

    const geometry: GeometryCollection = {
      type: 'GeometryCollection',
      geometries: [{
        type: 'Point',
        coordinates: coordinates.reverse()
      }]
    };

    let localities = await lastValueFrom(this.lajiApiService.post<CoordinateLocationResponse>('coordinates/location', geometry, { lang: 'multi' }).pipe(map(res => res.data.results)));

    localities = localities.filter(locality => {
      return locality.types.includes('municipality');
    });

    if (!localities.length) {
      return;
    }

    let matchFound = false;
    const nonMatches: string[] = [];

    localities.forEach(locality => {
      if (!locality.types.includes('municipality')) {
        return;
      }

      locality.address_components.forEach(component => {
        if (!component.types.includes('municipality')) {
          return;
        }

        Object.keys(component.short_name).forEach(lang => {
          if (component.short_name[lang as keyof typeof component.short_name]?.toLowerCase() === value.toLowerCase()) {
            matchFound = true;
          }
        });

        if (!matchFound) {
          nonMatches.push(component.short_name['fi']!);
        }
      });
    });

    if (matchFound || !nonMatches) {
      return;
    }

    return getError(field, `Coordinates do not match municipality, has ${value} but coordinates correspond to ${nonMatches.join(', ')}`);
  }

  async validateDocumentSequenceIdUnique(data: any, field: any) {
    const value: string = parseJSONPointer(data, field);
    const storePath = parseStoreSearchPath(field);
    const documentInternalSearchPath = getValueSiblingsPath(field);

    const siblings: JSONPathAllResponse[] = JSONPath({ json: data, path: documentInternalSearchPath, resultType: 'all', wrap: true });
    let duplicates = false;

    siblings.forEach((sibling) => {
      if (sibling.pointer === field) return;

      const siblingValue = sibling.value;

      if (Array.isArray(siblingValue) && siblingValue.includes(value)) {
        duplicates = true;
      } else {
        if (value === siblingValue) {
          duplicates = true;
        }
      }
    });

    if (duplicates) {
      return getError(field, 'Duplicate values found within submitted document.');
    }

    const searchBody = `${storePath}: "${value}"`;

    const docs = (await lastValueFrom(this.lajiStoreService.getAll<Document>(KotkaObjectFullType.document, { q: searchBody }))).data;

    if (!docs.member.length || (data.id && docs.member.length === 1 && docs.member[0].id === data.id)) {
      return;
    }

    const duplicateIDs: string[] = [];

    docs.member.forEach(document => {
      if (document.id === data.id) {
        return;
      }

      const id = document.id!;

      const results: Array<string | string[]> = JSONPath({ json: document, path: documentInternalSearchPath, wrap: true });

      results.forEach(result => {
        if (Array.isArray(result) && result.includes(value)) {
          duplicateIDs.push(id);
        } else if (value === result) {
          duplicateIDs.push(id);
        }
      });
    });
    if (!duplicateIDs.length) return;

    return getError(field, `Found duplicates in other documents, found in ${duplicateIDs.join(', ')}.`);
  }


}

export function getValueSiblingsPath(path: string) {
  return path.split('/').map(part => {
    return /^\d+$/g.test(part) ? '*' : part;
  });
}

export function getError(field: string, errorMsg: string, value?: any): ApiValidationError {
    return { errorCode: 'VALIDATION_EXCEPTION', details: { [field]: [errorMsg.replace('%{value}', value)] } };
  }
