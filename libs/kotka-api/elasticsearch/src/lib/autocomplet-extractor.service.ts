import { Injectable } from '@nestjs/common';
import { ExtractorInterface, REPLICAS, SHARDS } from './extractor.interface';
import { EsClientService } from './es-client.service';
import { BulkRequest, IndicesIndexSettingsKeys, MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class AutocompleteExtractorService implements ExtractorInterface {

  readonly INDEX = 'autocomplete';
  readonly MIN_INDEX_LENGTH = 3;
  readonly MAX_STRING_LENGTH = 256;

  constructor(private readonly esClientService: EsClientService) {}

  getMapping() {
    return {
      'dynamic_templates': [
        {
          'generic_autocomplete': {
            'path_match': '*.auto',
            'mapping': {
              'type': 'completion',
              'analyzer': 'simple',
              'search_analyzer': 'simple',
            }
          },
        },
        {
          'autocomplete_field': {
              'path_match': '*.field',
              'mapping': {
                'type': 'keyword'
              }
          }
        },
        {
          'autocomplete_output': {
            'path_match': '*.output',
            'mapping': {
              'type': 'keyword'
            }
          }
        },
      ]
    } as MappingTypeMapping;
  }

  getSettings(): IndicesIndexSettingsKeys {
    return {
      number_of_replicas: REPLICAS,
      number_of_shards: SHARDS,
    }
  }

  async addToBulk(esRow: { [key: string]: any }, bulk: BulkRequest, fields: string[] = []) {
    if (!esRow) {
      return;
    }

    const suggestions: ({ [key: string]: { [key: string]: { field: string, output: string, auto: string[] }}}) = {};

    fields.forEach((field) => {
      if (esRow[field as any]) {
        this.getInputSuggestion(esRow[field as any], field, suggestions);
      }
    })

    Object.values(suggestions).forEach((fieldValues) => {
      Object.values(fieldValues).forEach((suggestion) => {
        if (!bulk.body) {
          bulk.body = [];
        }

        (bulk.body as ({ [key: string]: any })[]).push({
          index: {
            _index: this.getIndex(),
            _id: `${suggestion.field}:${suggestion.output}`,
          }
        });

        (bulk.body as ({ [key: string]: any })[]).push({
          [suggestion.field]: suggestion
        });
      });
    });
  }

  getInputSuggestion(value: any, field: string, suggestions: { [key: string]: any }) {
    if (Array.isArray(value)) {
      value.forEach((val) => {
        this.getInputSuggestion(val, field, suggestions);
      });
    }

    if (typeof value !== 'string' || value.length > this.MAX_STRING_LENGTH) {
      return;
    }

    const suggestion: string[] = [];

    let pos;
    let val = value;

    do {
      pos = val.search(/\s+/);

      if (pos !== -1) {
        if (val.length < this.MIN_INDEX_LENGTH) {
          val = val.substring(pos + 1);
          continue;
        }

        suggestion.push(val);
        val = val.substring(pos + 1);
      } else {
        if (val.length < this.MIN_INDEX_LENGTH) {
          break;
        }

        suggestion.push(val);
      }
    } while (suggestion.length < 10 && pos !== -1);

    if (suggestion.length) {
      if (!suggestions[field]) {
        suggestions[field] = {};
      }

      if (!suggestions[field][value]) {
        suggestions[field][value] = {
          'field': field,
          'output': value,
          'auto': { input: suggestion }
        };
      }
    }
  }

  getIndex() {
    return this.INDEX;
  }

  getRelatedExtracts(): ExtractorInterface[] {
    return [];
  }

  async getAutocompleteSuggestion(field: string, query: string, limit = 10) {
    try {
      const res = await this.esClientService.search({
        index: this.getIndex(),
        _source: `${field}.output`,
        suggest: {
          autocomplete: {
            text: query,
            completion: {
              field: `${field}.auto`,
              size: limit,
            }
          }
        },
        allow_no_indices: true,
      });

      const options = res.suggest?.autocomplete[0].options;

      if (options && Array.isArray(options)) {
        return options.map((option: any) => option._source[field].output);
      } else if (options && !Array.isArray(options)) {
        return [(options as any)._source[field].output];
      }

    return [];
    } catch (error) {
      if ((error as any).meta?.body?.error?.root_cause?.[0]?.reason?.includes('no mapping found for field')) {
        return [];
      };

      throw error;
    }
  }
}
