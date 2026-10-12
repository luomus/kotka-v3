import { Inject, Injectable } from '@nestjs/common';
import { getPrefixAndId, getUri } from '@kotka/shared/utils';
import { ElasticBaseUnit, ElasticRowBases, EsMeasurement, MeasurementsStrings, NonPrefixedElasticSample, ElasticIndex, ArrayedObjects } from '@kotka/shared/models';
import { BulkRequest, IndicesIndexSettingsKeys, MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import { ExtractorInterface, REPLICAS, SHARDS } from '@kotka/api/elasticsearch';
import { ExtractorFieldMappingService } from '../mapper/extractor-field-mapping.service';
import { ExtractorConfig, INDEX_PREFIX, baseConfig, mergeConfig } from './config/base.config';

export class BaseExtractorService implements ExtractorInterface {
  protected readonly valueMappingService: ExtractorFieldMappingService;
  constructor(
    parentConfig: ExtractorConfig,
  ) {
    this.config = mergeConfig(parentConfig);
  }

  protected readonly config: ExtractorConfig;

  extractIDs(row: any) {
    const id = row.id!;
    const [ prefix, documentID ] = getPrefixAndId(id);

    row.documentURI = getUri(id);
    row.domain = prefix;
    row.documentID = documentID;
    row.documentQName = prefix + ':' + documentID;

    const [ namespacePart, objectIdPart ] = documentID.split('.');

    row.namespace = namespacePart;

    const objectId = objectIdPart.replace(/\D/g, '');

    row.objectID = isNaN(Number(objectId)) ? 0 : Number(objectId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  async addToBulk(document: any, bulk: BulkRequest, parent?: any): Promise<undefined | any[]> {
    return;
  }

  getIndex(): ElasticIndex {
    return `${INDEX_PREFIX}_${this.config.type}` as ElasticIndex;
  }

  getMapping() {
    return this.config.elasticMapping;
  }

  getSettings(): IndicesIndexSettingsKeys {
    return this.config.elasticSettings;
  }

  getRelatedExtracts(): ExtractorInterface[] {
    return [];
  }

  async extract<T extends ElasticRowBases | NonPrefixedElasticSample>(row: T) {
    await this.openValues<T>(row);
    this.removeUnwantedFields<T>(row);
    this.extractKeyValueFields<T>(row);
    if ('measurement' in row) {
      this.extractMeasurementsAsString(row as ElasticBaseUnit | NonPrefixedElasticSample);
    }
    this.removeNewLineFromFields<T>(row);
  }

  extractMeasurementsAsString(row: ElasticBaseUnit | NonPrefixedElasticSample) {
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
    this.config.removeNewLine.forEach((key) => {
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
  Object.keys(this.config.keyValueFields).forEach((key) => {
    const delimiter = this.config.keyValueFields[key];
    const value = row[key as keyof T];

    if (value) {
      const newValue: { [k: string]: string[] } = {};

      (value as string[]).forEach((val) => {
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
    this.config.remove.forEach((key) => {
      if (row[key as keyof T]) {
        delete row[key as keyof T];
      }
    });
  }

  async openValues<T>(row: T) {
    for (const key of this.config.open) {
      if (row[key as keyof T]) {
        const value = row[key as keyof T];

        let newValue: undefined |string | string[];

        if (Array.isArray(value)) {
          newValue = await Promise.all(value.map(async val => {
            const newVal = await this.valueMappingService.getFieldValueMapping(val as string, key);

            return newVal ?? val as string;
          }));
        } else {
          newValue = await this.valueMappingService.getFieldValueMapping(value as string, key);
        }

        if (Object.keys(this.config.mapOpenedIdsTo).includes(key)) {
          const newKey = this.config.mapOpenedIdsTo[key as keyof typeof this.config.mapOpenedIdsTo];

          (row[newKey as keyof T] as any) = row[key as keyof T];
          (row[key as keyof T] as any) = newValue as any;
        } else if (Object.keys(this.config.mapOpenedValuesTo).includes(key)) {
          const newKey = this.config.mapOpenedValuesTo[key as keyof typeof this.config.mapOpenedValuesTo];

          (row[newKey as keyof T] as any) = newValue as any;
        } else {
          (row[key as keyof T] as any) = newValue as any;
        }
      }
    }
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
        return `${splitDate[2]}-${splitDate[1].padStart(2, '0')}-${splitDate[0].padStart(2, '0')}`;
      } else {
        splitDate = date.split('-');

        if (splitDate.length === 3) {
          return `${splitDate[0]}-${splitDate[1].padStart(2, '0')}-${splitDate[2].padStart(2, '0')}`;
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

  flattenObjectArray<T extends Record<string, any>>(sourceArr: T[]): ArrayedObjects<T> {
    const flattened: Record<string, any> = {};

    sourceArr.forEach(source => {
      Object.keys(source).forEach((key) => {
        if (!flattened[key]) {
          if (typeof source[key as keyof T] === 'object' && !Array.isArray(source[key as keyof T])) {
            flattened[key] = {};
          } else {
            flattened[key] = [];
          }
        }

        const value = source[key as keyof T];

        if (value === undefined || value === null) {
          return;
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
          Object.keys(value).forEach((subKey) => {
            if (!flattened[key][subKey]) {
              flattened[key][subKey] = [];
            }

            const subValue = value[subKey];

            if (subValue === undefined || subValue === null) {
              return;
            }

            if (Array.isArray(subValue)) {
              subValue.forEach((v: any) => {
                if (!flattened[key][subKey].includes(v)) {
                  flattened[key][subKey].push(v);
                }
              });
            } else {
              if (!flattened[key][subKey].includes(subValue)) {
                flattened[key][subKey].push(subValue);
              }
            }
          });

        } else if (Array.isArray(value)) {
          value.forEach((v: any) => {
            if (!flattened[key].includes(v)) {
              flattened[key].push(v);
            }
          });
        } else {
          if (!flattened[key].includes(value)) {
            flattened[key].push(value);
          }
        }
      });
    });

    return flattened as ArrayedObjects<T>;
  }
}
