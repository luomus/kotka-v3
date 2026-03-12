/*
https://docs.nestjs.com/providers#services
*/

import { LajiApiService, LajiStoreService, AbschService, FormService } from '@kotka/api/services';
import { CoordinateLocationResponse, KotkaDocumentObjectFullType, SpecimenDataType, specimenDataTypeToNameMap } from '@kotka/shared/models';
import { Dataset, Document, StoreObject } from '@luomus/laji-schema';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { NamespaceData, NamespaceService } from './namespace.service';
import { acceptedPrefixes, convertCoordinatesToWGS84, defaultPrefix, JSONPathAllResponse, parseJSONPointer, parseStoreSearchPath } from '@kotka/shared/utils';
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
        return this.remoteValidate(query, options);
      }
    });
  }

  async validate(data: StoreObject, type: KotkaDocumentObjectFullType) {
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

    if (form.validators) {
      try {
        await lajiValidate.async(data, form.validators);
      } catch (err) {
        Object.keys(err).map(key => {
          if (Array.isArray(err[key])) {
            if (typeof err[key][0] === 'string') {
              const path1 = key.startsWith('.')? key : '.' + key;
              if (!errors[path1]) {
                errors[path1] = [];
              }
              errors[path1].push(...err[key]);
            } else if (typeof err[key][0] === 'object') {
              err[key].map(obj => {
                Object.keys(obj).map((path) => {
                  const path1 = path.startsWith('.')? path : '.' + path;
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
    let namespaceID: string = parseJSONPointer(data, field);
    let prefix;

    if (namespaceID.includes(':')) {
      [ prefix, namespaceID ] = namespaceID.split(':');
    }

    const datatype = data.datatype;

    const namespaces = await this.namespaceService.getNamespaces();

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

    const members: Dataset[] = await lastValueFrom(this.lajiStoreService.search<Dataset>(KotkaDocumentObjectFullType.dataset, { query: { match: { [datasetNameField]: datasetName }}}).pipe(map(res => res.data?.member)));

    if (members.length !== 0 && !(members.length === 1 && members[0].id && members[0].id === data.id)) {
      return this.getError(field, 'Dataset name must be unique.');
    }

    return {};
  }

  async validateIRCCNumber(data: Record<string, any>, field: string) {
    const value: string | undefined = parseJSONPointer(data, field);

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
    const value: string | undefined = parseJSONPointer(data, field);
    if (!value) {
      return {};
    }

    const coordinateSystem = data.gatherings[0].coordinateSystem!;
    const latitude = Number(data.gatherings[0].latitude!);
    const longitude = Number(data.gatherings[0].longitude!);

    const coordinates = convertCoordinatesToWGS84(latitude, longitude, coordinateSystem);

    if (!coordinates) {
      return 'Error converting coordinates to WGS84 for validation.';
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

  async validateDocumentSequenceIdUnique(data: any, field: any) {
    const value: string = parseJSONPointer(data, field);
    const storePath = parseStoreSearchPath(field);
    const documentInternalSearchPath = this.getValueSiblingsPath(field);

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
      return this.getError(field, 'Duplicate values found within submitted document.');
    }

    const searchBody = `${storePath}: '${value}'`;

    const docs = (await lastValueFrom(this.lajiStoreService.getAll<Document>(KotkaDocumentObjectFullType.document, { q: searchBody }))).data;

    if (!docs.member.length || (data.id && docs.member.length === 1 && docs.member[0].id === data.id)) {
      return {};
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
        } else if(value === result) {
          duplicateIDs.push(id);
        }
      });
    });
    if (!duplicateIDs.length) return {};

    return this.getError(field, `Found duplicates in other documents, found in ${duplicateIDs.join(', ')}.`);
  }

  private getError(field: string, errorMsg: string, value?: any) {
    return { errorCode: 'VALIDATION_EXCEPTION', details: { [field]: [errorMsg.replace('%{value}', value)] }};
  }

  private getValueSiblingsPath(path: string) {
    return path.split('/').map(part => {
      return /^\d+$/g.test(part) ? '*' : part;
    });
  }
}
