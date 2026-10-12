import { MappingTypeMapping, IndicesIndexSettingsKeys } from "@elastic/elasticsearch/lib/api/types";
import { REPLICAS, SHARDS } from "@kotka/api/elasticsearch";
import { merge } from 'lodash';

export const FORMAT_DATETIME = 'yyyy-MM-dd HH:mm:ss';
export const INDEX_PREFIX = 'specimen';
export const DEFAULT_INDEX = 'unit';

export type ExtractorConfig = {
  type?: string;
  open?: string[];
  mapOpenedIdsTo?: { [key: string]: string };
  mapOpenedValuesTo?: { [key: string]: string };
  remove?: string[];
  removeNewLine?: string[];
  keyValueFields?: { [k: string]: string };
  autocompleteFields?: string[];
  elasticMapping?: MappingTypeMapping;
  elasticSettings?: IndicesIndexSettingsKeys;
  hardCodedFields?: Record<string, {[key in 'label' | 'level']?: string}>;
};

export const baseConfig = {
  open:  [],
  mapOpenedIdsTo: {},
  mapOpenedValuesTo: {},
  remove: [
    'notes',
    '@type',
    '@context',
    'isPartOf'
  ],
  removeNewLine: [],
  keyValueFields: {},
  autocompleteFields: [],
  elasticMapping:  {
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
      'id': {
        'type': 'keyword'
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
        'format': FORMAT_DATETIME + '||date||yyyy-MM-dd\'T\'HH:mm:ss'
      },
      'dateEdited': {
        'type': 'date',
        'format': FORMAT_DATETIME + '||date||yyyy-MM-dd\'T\'HH:mm:ss'
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
        'format': FORMAT_DATETIME + '||date||yyyy-MM-dd\'T\'HH:mm:ss||yyyy-MM-dd||yyyy'
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
  },
  elasticSettings: {
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
  },
};

export const mergeConfig = (parent: ExtractorConfig): ExtractorConfig => {
  const mergedMapping = merge(baseConfig.elasticMapping, parent.elasticMapping ?? {});
  const mergedSettings = merge(baseConfig.elasticSettings, parent.elasticSettings ?? {});

  return {
    type: parent.type ?? DEFAULT_INDEX,
    open: parent.open ?? baseConfig.open,
    mapOpenedIdsTo: parent.mapOpenedIdsTo ?? baseConfig.mapOpenedIdsTo,
    mapOpenedValuesTo: parent.mapOpenedValuesTo ?? baseConfig.mapOpenedValuesTo,
    remove: [ ...(parent.remove ?? []), ...baseConfig.remove ],
    removeNewLine: parent.removeNewLine ?? baseConfig.removeNewLine,
    keyValueFields: parent.keyValueFields ?? baseConfig.keyValueFields,
    autocompleteFields: parent.autocompleteFields ?? baseConfig.autocompleteFields,
    elasticMapping: mergedMapping as MappingTypeMapping,
    elasticSettings: mergedSettings as IndicesIndexSettingsKeys,
  };
};
