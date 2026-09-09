import { Injectable } from '@nestjs/common';
import { ExtractorInterface, SHARDS, REPLICAS } from '@kotka/api/elasticsearch';
import { LinkableTaxon } from './taxon-linking.service';

export const TAXON_INDEX = 'taxon';
export const ENDANGERED_STATUS = [
  'MX.iucnEX', 'MX.iucnEW', 'MX.iucnRE', 'MX.iucnCR', 'MX.iucnEN','MX.iucnVU','MX.iucnNT'
];

@Injectable()
export class TaxonExtractorService implements ExtractorInterface {
  getIndex(): string {
    return TAXON_INDEX;
  }

  getMapping(): any {
    return {
      dynamic_templates: [
        {
          generic: {
            match: "*",
            mapping: {
              index: false,
            }
          },
        }
      ],
      properties: {
        id: {
          type: 'keyword',
          normalizer: 'lowercase_normalizer'
        },
        taxonRank: {
          type: 'keyword',
          normalizer: 'lowercase_normalizer'
        },
        taxonSearch: {
          type: 'nested',
          properties: {
            scientificName: {
              type: 'keyword',
              normalizer: 'lowercase_normalizer'
            },
            author: {
              type: 'keyword',
              normalizer: 'lowercase_normalizer'
            },
          }
        }
      }
    }
  }

  getSettings(): any {
    return {
      number_of_shards: SHARDS,
      number_of_replicas: REPLICAS,
      max_result_window: 500000,
      analysis: {
        normalizer: {
          lowercase_normalizer: {
            type: 'custom',
            filter: [ 'lowercase' ]
          }
        }
      }
    }
  }

  async addToBulk(data: LinkableTaxon, bulk: any): Promise<void> {
    if (bulk.body === undefined) {
      bulk.body = [];
    }

    bulk.body.push({
      index: {
        _index: this.getIndex(),
        _id: data.id
      }
    });

    const searchableTaxons: { scientificName: string; author?: string }[] = [{ scientificName: data.scientificName, author: data.author }];

    if (data.synonyms) {
      searchableTaxons.push(...data.synonyms)
    }

    if (data.redListStatus && ENDANGERED_STATUS.includes(data.redListStatus)) {
      data.endangeredStatus = data.redListStatus as LinkableTaxon['endangeredStatus'];
    }

    const searchData = { ...data, taxonSearch: searchableTaxons};
    return bulk.body.push(searchData);
  }

  getRelatedExtracts(): ExtractorInterface[] {
    return [];
  }
}
