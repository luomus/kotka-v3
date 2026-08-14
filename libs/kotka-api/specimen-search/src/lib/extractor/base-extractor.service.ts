import { Injectable } from '@nestjs/common';
import { getPrefixAndId, getUri } from '@kotka/shared/utils';
import { ElasticDocumentRow, ElasticUnitRow, EsMeasurement, MeasurementsStrings, NonPrefixedElasticSample } from '../elastic-document.interface';
import { BulkRequest, IndicesIndexSettingsKeys, MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import { ExtractorInterface, REPLICAS, SHARDS } from '@kotka/api/elasticsearch';
import { ExtractorValueMappingService } from '../mapper/extractor-value-mapping.service';

@Injectable()
export class BaseExtractorService implements ExtractorInterface {
  protected readonly valueMappingService!: ExtractorValueMappingService;
  open: string[] = [];
  type?: string;
  mapOpenedIdsTo: { [key: string]: string } = {};
  mapOpenedValuesTo: { [key: string]: string } = {};
  remove = [
    'id',
    'notes',
    '@type',
    '@context',
    'isPartOf'
  ];
  removeNewLine: string[] = [];
  keyValueFields: { [k: string]: string } = {};
  autocompleteFields: string[] = [];

  constructor() {}

  protected readonly FORMAT_DATETIME = 'yyyy-MM-dd HH:mm:ss';
  protected readonly INDEX_PREFIX = 'specimen';
  protected readonly DEFAULT_INDEX = 'unit';

  extractIDs(row: any) {
    const id = row.id!;
    const [ prefix, documentID ] = getPrefixAndId(id);

    row.documentURI = getUri(id);
    row.domain = prefix;
    row.documentID = documentID;
    row.documentQName = prefix + ':' + documentID;

    let [ namespace, objectId ] = documentID.split('.');

    row.namespace = namespace;

    objectId = objectId.replace(/\D/g, '');

    row.objectID = isNaN(Number(objectId)) ? 0 : Number(objectId);
  }

  async addToBulk(document: any, bulk: BulkRequest, parent?: any): Promise<void> {

  }

  getIndex(): string {
    return `${this.INDEX_PREFIX}_${this.type || this.DEFAULT_INDEX}`;
  }

  getMapping() {
    const baseMapping: MappingTypeMapping = {
      'dynamic_templates': [
        {
          'generic': {
            'match': '*',
            'mapping': {
              'type': 'text',
              'fields': {
                'raw': {'type': 'keyword'}
              }
            }
          },
        },
      ],
      'date_detection': false,
      'properties': {
        'accepted': {
          'type': 'boolean'
        },
        'firstInDocument': {
          'type': 'boolean'
        },
        'acquisitionDate': {
          'type': 'date',
          'format': 'date',
          'fields': {'raw': {'type': 'keyword'}}
        },
        'branchLocationTree': {
          'type': 'text',
        },
        'branchLocationID': {
          'type': 'keyword'
        },
        'accessionLocationID': {
          'type': 'keyword'
        },
        'branchID': {
          'type': 'keyword'
        },
        'sampleExists': {
          'type': 'boolean'
        },
        'collectionID': {
          'type': 'keyword'
        },
        'collectionTree': {
          'type': 'text',
        },
        'datasetID': {
          'type': 'keyword'
        },
        'dateBegin': {
          'type': 'date',
          'format': 'date',
          'fields': {'raw': {'type': 'keyword'}}
        },
        'dateCreated': {
          'type': 'date',
          'format': this.FORMAT_DATETIME + '||date||yyyy-MM-dd\'T\'HH:mm:ss'
        },
        'dateEdited': {
          'type': 'date',
          'format': this.FORMAT_DATETIME + '||date||yyyy-MM-dd\'T\'HH:mm:ss'
        },
        'dateEnd': {
          'type': 'date',
          'format': 'date',
          'fields': {'raw': {'type': 'keyword'}}
        },
        'documentURI': {
          'type': 'keyword'
        },
        'documentID': {
          'type': 'keyword'
        },
        'documentQName': {
          'type': 'keyword'
        },
        'eventDate': {
          'type': 'date',
          'format': this.FORMAT_DATETIME + '||date||yyyy-MM-dd\'T\'HH:mm:ss||yyyy-MM-dd||yyyy'
        },
        'gatheringCount': {
          'type': 'integer'
        },
        'hasPicture': {
          'type': 'boolean'
        },
        'pictureCount': {
          'type': 'integer'
        },
        'identificationCount': {
          'type': 'integer'
        },
        'isType': {
          'type': 'boolean'
        },
        'measurement': {
          'type': 'object'
        },
        'relationship': {
          'type': 'object'
        },
        'namespace': {
          'type': 'keyword'
        },
        'objectID': {
          'type': 'long'
        },
        'specimenCount': {
          'type': 'integer'
        },
        'typeCount': {
          'type': 'integer'
        },
        'unitCount': {
          'type': 'integer'
        },
        'sampleCount': {
          'type': 'integer'
        },
        'wgs84Latitude': {
          'type': 'float',
          'fields': {'raw': {'type': 'keyword'}}
        },
        'wgs84Location': {
          'type': 'geo_point'
        },
        'wgs84Longitude': {
          'type': 'float',
          'fields': {'raw': {'type': 'keyword'}}
        },
      }
    };

    return baseMapping;
  }

  getSettings(): IndicesIndexSettingsKeys {
    return {
      number_of_shards: SHARDS,
      number_of_replicas: REPLICAS,
      max_result_window: 5000000,
      analysis: {
        filter: {
          kotka_folding: {
            type: 'icu_folding',
            unicode_set_filter: '[^åäöÅÄÖ]'
          },
        },
        analyzer: {
          default: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'kotka_folding']
          }
        }
      }
    };
  }

  getRelatedExtracts(): ExtractorInterface[] {
    return [];
  }

  async extract<T extends ElasticDocumentRow | NonPrefixedElasticSample>(row: T) {
    await this.openValues<T>(row);
    this.removeUnwantedFields<T>(row);
    this.extractKeyValueFields<T>(row);
    if (row['measurement']) {
      this.extractMeasurementsAsString(row);
    }
    this.removeNewLineFromFields<T>(row);
  }

  extractMeasurementsAsString(row: ElasticUnitRow | NonPrefixedElasticSample) {
    if (!row['measurement']) {
      return;
    }

    const measurement: EsMeasurement = row['measurement'];
    const measurementStrings: MeasurementsStrings = {};

    Object.keys(measurement).forEach(key => {
      if (measurement[key as keyof MeasurementsStrings] !== undefined && key !== 'id') {
        (measurementStrings as any)[key] = measurement[key as keyof MeasurementsStrings]?.map((val: number) => val.toString());
      }
    });
    (row['measurement'] as MeasurementsStrings) = measurementStrings;
  }

  removeNewLineFromFields<T>(row: T) {
    this.removeNewLine.forEach((key) => {
      if (row[key as keyof T] !== undefined) {
        const value = row[key as keyof T] as string | string[];

        if (Array.isArray(value)) {
          (row[key as keyof T] as any) = value.map((val) => val.replace(/\r?\n|\r/g, ''));
        } else {
          (row[key as keyof T] as any) = value.replace(/\r?\n|\r/g, '');
        }
      }
    });
  }

  extractKeyValueFields<T>(row: T) {
  Object.keys(this.keyValueFields).forEach((key) => {
    const delimiter = this.keyValueFields[key];
    const value = row[key as keyof T];

    if (value) {
      const newValue: { [k: string]: string[] } = {};

      (value as string[]).forEach((val, idx) => {
        const parts = val.split(delimiter!);

        if (parts.length === 2 && parts[1] !== '') {
          if (parts[0] in newValue) {
            newValue[parts[0]].push(parts[1]);
          } else {
            newValue[parts[0]] = [parts[1]];
          }
        }
      });

      (row[key as keyof T] as any) = newValue;
    }
  });
  }


  removeUnwantedFields<T>(row: T) {
    this.remove.forEach((key) => {
      if (row[key as keyof T]) {
        delete row[key as keyof T];
      }
    });
  }

  async openValues<T>(row: T) {
    for (let key of this.open) {
      if (row[key as keyof T]) {
        const value = row[key as keyof T];

        let newValue: undefined |string | string[];

        if (Array.isArray(value)) {
          newValue = await Promise.all(value.map(async val => {
            const newVal = await this.valueMappingService.getValueMapping(val as string, key);

            return newVal ?? val as string;
          }));
        } else {
          newValue = await this.valueMappingService.getValueMapping(value as string, key);
        }

        if (Object.keys(this.mapOpenedIdsTo).includes(key)) {
          const newKey = this.mapOpenedIdsTo[key as keyof typeof this.mapOpenedIdsTo];

          (row[newKey as keyof T] as any) = row[key as keyof T];
          (row[key as keyof T] as any) = newValue as any;
        } else if (Object.keys(this.mapOpenedValuesTo).includes(key)) {
          const newKey = this.mapOpenedValuesTo[key as keyof typeof this.mapOpenedValuesTo];

          (row[newKey as keyof T] as any) = newValue as any;
        } else {
          (row[key as keyof T] as any) = newValue as any;
        }
      }
    };
  }


  dateToElasticDate(date: string, fill?: string): string | undefined {
    if (date.length === 4) {
      if (fill) {
        date = fill + date;
      } else {
        date = '01.01.' + date;
      }
    }

    try {
      let splitDate = date.split('.');

      if (splitDate.length === 3) {
        return `${splitDate[2]}-${splitDate[1].padStart(2, '0')}-${splitDate[0].padStart(2, '0')}`
      } else {
        splitDate = date.split('-');

        if (splitDate.length === 3) {
          return `${splitDate[0]}-${splitDate[1].padStart(2, '0')}-${splitDate[2].padStart(2, '0')}`
        } else {
          const parsedDate = new Date(date);

          if (!isNaN(parsedDate.getTime())) {
            return `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate.getDate().toString().padStart(2, '0')}`;
          }
        }
      }

      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  dateTimeToElasticDateTime(date: string): string {
    const timezoneIndex = date.indexOf('+');
    if (timezoneIndex !== -1) {
      date = date.substring(0, timezoneIndex);
    }

    const decimalIndex = date.indexOf('.');
    if (decimalIndex !== -1) {
      date = date.substring(0, decimalIndex);
    }

    date = date.replace('T', ' ');

    return date;
  }
}
