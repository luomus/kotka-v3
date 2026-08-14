import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ExtractorInterface } from './extractor.interface';
import { StoreObject } from '@luomus/laji-schema/models';
import { BulkRequest, IndicesIndexSettings, MappingTypeMapping, SearchRequest } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class EsClientService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async search(search: SearchRequest) {
    return await this.elasticsearchService.search({...search, allow_no_indices: true, ignore_unavailable: true});
  }

  async searchQuery(index: string, query: any) {
    return await this.search({
      index,
      query: query
    });
  }

  async searchQueryString(index: string, queryString: string, limit = 25, page = 0, sort?: any, fields?: string[]) {
    const query: SearchRequest = {
      index,
      query: { bool: { must: [{ query_string: { query: queryString }}]}},
      size: limit,
    };

    if (fields) {
      query['_source'] = fields;
    }

    if (sort) {
      query['sort'] = sort;
    }

    if (page !== 0) {
      query['from'] = page * limit;
    }

    return await this.search(query);
  }

  async searchAndAggregate(index: string, queryString: any, filters: {[key: string]: string | string[] | boolean | number },  agg: string[], fields: string[], limit = 10) {
    const query: SearchRequest = {
      index,
    }

    if (query) {
      query['query'] = { bool: { must: [{ query_string: { query: queryString }}]}};
    }

    if (filters) {
      if (!query['query']) {
        query['query'] = { bool: { must: []}};
      }

      const searchFilters = [];

      Object.keys(filters).forEach(key => {
        searchFilters.push({ term: { [key]: filters[key] }});
      });

    }
  }

  async hasIndex(index: string) {
    return await this.elasticsearchService.indices.exists({
      index
    });
  }

  async deleteIndex(index: string) {
    await this.elasticsearchService.indices.delete({
      index
    });
  }

  async createIndex(index: string, mappings: MappingTypeMapping, settings: IndicesIndexSettings) {
    await this.elasticsearchService.indices.create({
      index,
      mappings,
      settings
    });
  }

  async prepareIndex(extractor: ExtractorInterface) {
    const index = extractor.getIndex();

    if (!(await this.hasIndex(index))) {
      await this.createIndex(index, extractor.getMapping(), extractor.getSettings());
    }


    const relatedExtracts = extractor.getRelatedExtracts();

    if (relatedExtracts) {
      for (const relatedExtract of relatedExtracts) {
        await this.prepareIndex(relatedExtract);
      }
    }
  }

  async indexSingle(result: StoreObject, extractor: ExtractorInterface) {
    const bulk: BulkRequest = {};
    this.prepareIndex(extractor);

    await extractor.addToBulk(result, bulk);

    return await this.indexBulk(bulk);
  }

  indexMany(results: StoreObject[], extractor: ExtractorInterface) {
    const bulk: BulkRequest = {};
    this.prepareIndex(extractor);

    for (const result of results) {
      extractor.addToBulk(result, bulk);
    }

    return this.indexBulk(bulk);
  }

  async indexBulk(bulk: BulkRequest) {
    return await this.elasticsearchService.bulk(bulk);
  }

  async indexResults(results: any[], extractor: ExtractorInterface, batchSize = 100000) {
    if (!Array.isArray(results)) {
        throw new Error('Results to extract must be in an array');
    }
    await this.prepareIndex(extractor);

    let bulk: BulkRequest = {};
    let cnt = 0;
    for (const result of results) {
        cnt = bulk.body?.length ? bulk.body?.length / 2 : 0;
        extractor.addToBulk(result, bulk);
        if (cnt >  batchSize) {
          await this.indexBulk(bulk);
          bulk = {};
        }
        //TODO Progress bar tracking?
    }

    if (bulk.body?.length) {
      await this.indexBulk(bulk);
    }
  }

  async getAggregate(index: string, fields: string[], queryString = '', limit = 10) {
    const aggs: any = {};
    fields.forEach(field => (aggs[field] = { terms: { field: `${field}.raw`, size: limit }}));
    const query = { bool: { must: [{ query_string: { query: queryString }}]}};

    const aggregations = (await this.search({
      index,
      size: 0,
      aggs,
      query
    })).aggregations;

    if (!aggregations) {
      return;
    }

    const result: any = {};

    Object.keys(aggregations).forEach(field => {
      result[field] = (aggregations[field] as any).buckets;
    });

    return result;
  }

  async getMappedFields(index: string) {
    let mapping = (await this.elasticsearchService.indices.getMapping({
      index,
      allow_no_indices: true,
      ignore_unavailable: true,
    }))?.[index]?.mappings as MappingTypeMapping;


    if (!mapping) {
      return [];
    }

    const fields: string[] = [];

    this.traverseMapping(mapping, fields);

    return fields;
  }

  traverseMapping(mapping: MappingTypeMapping, path: string[], parent?: string) {
    if (mapping.properties) {
      Object.keys(mapping.properties).forEach(key => {
        const field = mapping.properties![key];

        if (field.type) {
          return path.push(parent ? `${parent}.${key}` : key);
        }

        this.traverseMapping(field as MappingTypeMapping, path, parent ? `${parent}.${key}` : key);
      });
    }
  }
}
