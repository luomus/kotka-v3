import { inject, Injectable } from '@angular/core';
import {
  FieldType,
  ILabelData,
  ILabelField,
  SchemaService,
} from '@luomus/label-designer';
import { Document, Gathering, Identification, Unit } from '@luomus/laji-schema';
import { forkJoin, map, Observable, of } from 'rxjs';
import { ApiClient } from '@kotka/ui/core';
import { convertYkjToWGS84, getUri } from '@kotka/shared/utils';
import { formatCoordinates } from './coordinate-labels';
import { formatDate } from './date-labels';

type TaxonData = Record<string, any>;

interface AugmentedIdentification extends Identification {
  taxon_accepted?: string;
  author_accepted?: string;
}

interface AugmentedUnit extends Unit {
  identifications?: AugmentedIdentification[];
}

interface AugmentedGathering extends Gathering {
  coordinates_long?: string;
  coordinates_short?: string;
  wgs84Latitude_1dec?: string;
  wgs84Longitude_1dec?: string;
  wgs84Latitude_2dec?: string;
  wgs84Longitude_2dec?: string;
  wgs84Latitude_3dec?: string;
  wgs84Longitude_3dec?: string;
  wgs84Latitude_4dec?: string;
  wgs84Longitude_4dec?: string;
  wgs84Latitude_5dec?: string;
  wgs84Longitude_5dec?: string;
  date_roman?: string;
  date_month?: string;
  units?: AugmentedUnit[];
}

interface AugmentedDocument extends Document {
  uri?: string;
  domain?: string;
  objectID?: string;
  gatherings: [AugmentedGathering, ...AugmentedGathering[]];
}

// not a complete list of field names, only those needed for custom fields in this service
type FieldName = keyof AugmentedDocument |
  `gatherings.${keyof AugmentedGathering}` |
  `gatherings.units.${keyof AugmentedUnit}` |
  `gatherings.units.identifications.${keyof AugmentedIdentification}` |
  '';

interface CustomLabelField extends ILabelField {
  field: FieldName;
  afterField?: FieldName;
}

@Injectable({
  providedIn: 'root',
})
export class SpecimenLabelDesignerService {
  private apiClient = inject(ApiClient);
  private schemaService = inject(SchemaService);

  private customFields: CustomLabelField[] = [
    {
      field: 'uri',
      content: 'http://tun.fi/ID',
      label: 'URI - QRCode',
      type: FieldType.qrCode,
    },
    {
      field: 'uri',
      content: 'http://tun.fi/ID',
      label: 'URI',
      type: FieldType.uri,
    },
    { field: 'domain', label: 'Domain', type: FieldType.domain },
    { field: 'id', label: 'ID', type: FieldType.id },
    { field: 'objectID', label: 'ObjectID' },
    {
      field: '',
      label: 'Free text',
      content: 'Free text',
      type: FieldType.text,
    },
    {
      field: 'gatherings.units.identifications.taxon_accepted',
      label: 'Taxon (accepted)',
      afterField: 'gatherings.units.identifications.taxon',
    },
    {
      field: 'gatherings.units.identifications.author_accepted',
      label: 'Author (accepted)',
      afterField: 'gatherings.units.identifications.author',
    },
    {
      field: 'gatherings.coordinates_short',
      label: 'Coordinates (short)',
      afterField: 'gatherings.coordinatesVerbatim',
    },
    {
      field: 'gatherings.coordinates_long',
      label: 'Coordinates (long)',
      afterField: 'gatherings.coordinatesVerbatim',
    },
    {
      field: 'gatherings.wgs84Latitude_1dec',
      label: 'WGS84 latitude (1 decimal place)',
      afterField: 'gatherings.wgs84Longitude',
    },
    {
      field: 'gatherings.wgs84Longitude_1dec',
      label: 'WGS84 longitude (1 decimal place)',
      afterField: 'gatherings.wgs84Longitude',
    },
    {
      field: 'gatherings.wgs84Latitude_2dec',
      label: 'WGS84 latitude (2 decimal place)',
      afterField: 'gatherings.wgs84Longitude',
    },
    {
      field: 'gatherings.wgs84Longitude_2dec',
      label: 'WGS84 longitude (2 decimal place)',
      afterField: 'gatherings.wgs84Longitude',
    },
    {
      field: 'gatherings.wgs84Latitude_3dec',
      label: 'WGS84 latitude (3 decimal place)',
      afterField: 'gatherings.wgs84Longitude',
    },
    {
      field: 'gatherings.wgs84Longitude_3dec',
      label: 'WGS84 longitude (3 decimal place)',
      afterField: 'gatherings.wgs84Longitude',
    },
    {
      field: 'gatherings.wgs84Latitude_4dec',
      label: 'WGS84 latitude (4 decimal place)',
      afterField: 'gatherings.wgs84Longitude',
    },
    {
      field: 'gatherings.wgs84Longitude_4dec',
      label: 'WGS84 longitude (4 decimal place)',
      afterField: 'gatherings.wgs84Longitude',
    },
    {
      field: 'gatherings.wgs84Latitude_5dec',
      label: 'WGS84 latitude (5 decimal place)',
      afterField: 'gatherings.wgs84Longitude',
    },
    {
      field: 'gatherings.wgs84Longitude_5dec',
      label: 'WGS84 longitude (5 decimal place)',
      afterField: 'gatherings.wgs84Longitude',
    },
    {
      field: 'gatherings.date_roman',
      label: 'Date with Roman',
      afterField: 'gatherings.dateEnd',
    },
    {
      field: 'gatherings.date_month',
      label: 'Date with abbr. month',
      afterField: 'gatherings.dateEnd',
    },
  ];

  private skipFields: string[] = ['datatype', 'images'];

  getAllFields(specimenFormId: string): Observable<ILabelField[]> {
    return this.apiClient.getForm(specimenFormId).pipe(
      map((form) =>
        form
          ? this.schemaService.schemaToAvailableFields(form.schema, [], {
              skip: this.skipFields,
            })
          : [],
      ),
      map((result) => {
        result = [...result];

        for (const cf of [...this.customFields].reverse()) {
          const { afterField, ...rest } = cf;
          const item: ILabelField = rest;

          if (!afterField) {
            result.splice(0, 0, item);
          } else {
            const idx = result.findIndex((f) => f.field === afterField);
            if (idx >= 0) {
              result.splice(idx + 1, 0, item);
            } else {
              result.push(item);
            }
          }
        }

        return result;
      }),
    );
  }

  getData(fields: ILabelField[], documents: Document[]): Observable<ILabelData[]> {
    return this.augmentDocuments(documents).pipe(
      map((data) =>
        this.schemaService.convertDataToLabelData(
          fields,
          data,
          'gatherings.units',
          {},
        ),
      ),
    );
  }

  private augmentDocuments(documents: Document[]): Observable<AugmentedDocument[]> {
    return this.fetchTaxonDataForDocuments(documents).pipe(
      map((taxonData) =>
        documents.map((document) => this.augmentDocument(document, taxonData)),
      ),
    );
  }

  private augmentDocument(document: Document, taxonData: TaxonData): AugmentedDocument {
    const result: AugmentedDocument = { ...document };

    if (result.id) {
      result.uri = getUri(result.id);
      const idParts = result.id.split(':');
      result.id = idParts[idParts.length - 1];
      result.domain = result.uri.replace(result.id, '');

      const parts = result.id.split('.');
      if (parts.length > 1) {
        result.objectID = parts[parts.length - 1];
      }
    }

    result.gatherings = this.augmentGatherings(result.gatherings, taxonData);

    return result;
  }

  private augmentGatherings(
    gatherings: [Gathering, ...Gathering[]], taxonData: TaxonData
  ): [AugmentedGathering, ...AugmentedGathering[]] {
    const [first, ...rest] = gatherings;
    return [
      this.augmentGathering(first, taxonData),
      ...rest.map((g) => this.augmentGathering(g, taxonData)),
    ];
  }

  private augmentGathering(gathering: Gathering, taxonData: TaxonData): AugmentedGathering {
    const result: AugmentedGathering = { ...gathering };

    result.coordinates_short = formatCoordinates(
      result.coordinateSystem,
      result.latitude,
      result.longitude,
      result.wgs84Latitude,
      result.wgs84Longitude,
      result.coordinateRadius,
      'short',
    );
    result.coordinates_long = formatCoordinates(
      result.coordinateSystem,
      result.latitude,
      result.longitude,
      result.wgs84Latitude,
      result.wgs84Longitude,
      result.coordinateRadius,
      'long',
    );

    if (
      result.coordinateSystem === 'MY.coordinateSystemYkj' &&
      result.latitude &&
      result.longitude &&
      !(result.wgs84Latitude && result.wgs84Longitude)
    ) {
      const converted = convertYkjToWGS84(
        result.latitude,
        result.longitude,
      );
      if (converted) {
        if (!result.wgs84Latitude) {
          result.wgs84Latitude = converted[0].toString();
        }
        if (!result.wgs84Longitude) {
          result.wgs84Longitude = converted[1].toString();
        }
      }
    }

    if (result.wgs84Latitude) {
      result.wgs84Latitude_1dec = this.roundToDecimals(
        result.wgs84Latitude,
        1,
      );
      result.wgs84Latitude_2dec = this.roundToDecimals(
        result.wgs84Latitude,
        2,
      );
      result.wgs84Latitude_3dec = this.roundToDecimals(
        result.wgs84Latitude,
        3,
      );
      result.wgs84Latitude_4dec = this.roundToDecimals(
        result.wgs84Latitude,
        4,
      );
      result.wgs84Latitude_5dec = this.roundToDecimals(
        result.wgs84Latitude,
        5,
      );
    }
    if (result.wgs84Longitude) {
      result.wgs84Longitude_1dec = this.roundToDecimals(
        result.wgs84Longitude,
        1,
      );
      result.wgs84Longitude_2dec = this.roundToDecimals(
        result.wgs84Longitude,
        2,
      );
      result.wgs84Longitude_3dec = this.roundToDecimals(
        result.wgs84Longitude,
        3,
      );
      result.wgs84Longitude_4dec = this.roundToDecimals(
        result.wgs84Longitude,
        4,
      );
      result.wgs84Longitude_5dec = this.roundToDecimals(
        result.wgs84Longitude,
        5,
      );
    }

    result.date_roman = formatDate(result.dateBegin, result.dateEnd);
    result.date_month = formatDate(result.dateBegin, result.dateEnd, 'abbr');

    result.units = this.augmentUnits(result.units, taxonData);

    return result;
  }

  private augmentUnits(units: Unit[] | undefined, taxonData: TaxonData): AugmentedUnit[] | undefined {
    return units?.map(unit => this.augmentUnit(unit, taxonData));
  }

  private augmentUnit(unit: Unit, taxonData: TaxonData): AugmentedUnit {
    const result: AugmentedUnit = { ...unit };
    result.identifications = this.augmentIdentifications(result.identifications, taxonData);
    return result;
  }

  private augmentIdentifications(identifications: Identification[] | undefined, taxonData: TaxonData): AugmentedIdentification[] | undefined {
    return identifications?.map(identification => this.augmentIdentification(identification, taxonData));
  }

  private augmentIdentification(identification: Identification, taxonData: TaxonData): AugmentedIdentification {
    const result: AugmentedIdentification = { ...identification };

    if (identification.taxon && taxonData[identification.taxon]) {
      const acceptedTaxon = taxonData[identification.taxon];
      result.taxon_accepted = acceptedTaxon.scientificName;
      result.author_accepted = acceptedTaxon.scientificNameAuthorship;
    }

    return result;
  }

  // TODO investigate if all taxa could be fetched in one request instead of one by one and add caching
  private fetchTaxonDataForDocuments(documents: Document[]): Observable<TaxonData> {
    const result: Record<string, any> = {};

    const taxonNames: string[] = [];

    documents.forEach((document) => {
      document.gatherings.forEach((gathering) => {
        gathering.units?.forEach((unit) => {
          unit.identifications?.forEach((identification) => {
            if (identification.taxon && !taxonNames.includes(identification.taxon)) {
              taxonNames.push(identification.taxon);
            }
          });
        });
      });
    });

    if (taxonNames.length === 0) {
      return of(result);
    }

    return forkJoin(taxonNames.map(taxonName => this.apiClient.searchTaxon(taxonName, 'exact'))).pipe(map(taxaResults => {
      taxonNames.forEach((taxonName, idx) => {
        result[taxonName] = taxaResults[idx]?.results?.[0];
      });
      return result;
    }));
  }

  private roundToDecimals(
    value: string | undefined,
    decimals: number,
  ): string | undefined {
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num.toFixed(decimals);
  }
}
