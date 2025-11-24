/*
https://docs.nestjs.com/providers#services
*/

import { LajiApiService, LajiStoreService, AbschService } from '@kotka/api/services';
import { CoordinateLocationResponse, KotkaDocumentObjectFullType, specimenDataTypeToNameMap } from '@kotka/shared/models';
import { Dataset, Document } from '@luomus/laji-schema';
import { Injectable } from '@nestjs/common';
import { get } from 'lodash';
import { lastValueFrom, map } from 'rxjs';
import { NamespaceData, NamespaceService } from './namespace.service';
import { acceptedPrefixes, convertCoordinatesToWGS84, defaultPrefix } from '@kotka/shared/utils';
import { GeometryCollection } from 'geojson';
@Injectable()
export class ValidationService {
  constructor(
    private readonly lajiApiService: LajiApiService,
    private readonly lajiStoreService: LajiStoreService,
    private readonly abschService: AbschService,
    private readonly namespaceService: NamespaceService,
  ) { }

  async remoteValidate(query, options) {
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
      default:
        try {
          await lastValueFrom(this.lajiApiService.post('documents/validate', JSON.parse(options.body), query));
        } catch (e) {
          if (e.response.status === 422) {
            error = { error: { details: e.response.data.error.details }};
          } else {
            throw e;
          }
        }
    }

    return error;
  }

  async validateAllowedNamespace(data: Record<string, any>, field: string) {
    if (field[0] === '.') {
      field = field.slice(1);
    }
    const namespaces = await this.namespaceService.getNamespaces();
    let namespaceID = get(data, field);
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

  validateNamespaceForType(namespaceID: string, datatype: string, namespaces: NamespaceData[]) {
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

  validatePrefixForNamespace(prefix: string, namespaceID, namespaces: NamespaceData[]) {
      const namespace = namespaces.find(namespace => namespace.namespace_id === namespaceID);

      if (!acceptedPrefixes.includes(prefix)) {
        return `Unknown prefix "${prefix}" not accepted.`;
      }

      if (
        !(namespace.qname_prefix === 'all' ||
        (prefix === defaultPrefix && namespace.qname_prefix === '') ||
        prefix === namespace.qname_prefix)
      ) {
        return `Unacceptable prefix in namespace, has "${prefix}" but accepts only "${namespace.qname_prefix || defaultPrefix}".`;
      }
  }

  async validateDatasetNameUnique(data, field) {
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
      return;
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
    const value: string = data.gatherings[0].municipality;
    if (!value) {
      return;
    }

    const coordinateSystem = data.gatherings[0].coordinateSystem;
    const latitude = Number(data.gatherings[0].latitude);
    const longitude = Number(data.gatherings[0].longitude);

    const coordinates = convertCoordinatesToWGS84(latitude, longitude, coordinateSystem);
    const geometry: GeometryCollection = {
      type: 'GeometryCollection',
      geometries: [{
        type: 'Point',
        coordinates: coordinates.reverse()
      }]
    }

    const localities = await lastValueFrom(this.lajiApiService.post<CoordinateLocationResponse>('coordinates/location', geometry, { lang: 'multi' }).pipe(map(res => res.data)));

    if (!localities.results.length) {
      return {};
    }

    let matchFound = false;
    const nonMatches = [];

    localities.results.forEach(locality => {
      if (!locality.types.includes('municipality')) {
        return;
      }

      locality.address_components.forEach(component => {
        if (!component.types.includes('municipality')) {
          return;
        }

        Object.keys(component.short_name).forEach(lang => {
          if(component.short_name[lang].toLowerCase() === value.toLowerCase()) {
            matchFound = true;
          }
        })

        if (!matchFound) {
          nonMatches.push(component.short_name['fi']);
        }
      });
    });

    if (matchFound || !nonMatches) {
      return {};
    }

    return this.getError(field, `Coordinates do not match municipality, has ${value} but coordinates correspond to ${nonMatches.join(', ')}`);
  }

  private getError(field: string, errorMsg: string, value?: any) {
    return { error: { details: { [field]: [errorMsg.replace('%{value}', value)] }}};
  }
}
