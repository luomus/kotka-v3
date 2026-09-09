import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ExtractorInterface } from './extractor.interface';
import { StoreObject } from '@luomus/laji-schema/models';
import { BulkRequest, IndicesIndexSettings, MappingTypeMapping, SearchRequest } from '@elastic/elasticsearch/lib/api/types';

interface SearchQuery {
  index: string;
  query?: string;
  sort?: string;
  body?: any;
  page?: number;
  pageSize?: number;
  fields?: string;
}

@Injectable()
export class EsClientService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  getSearchBody(base: any, query: SearchQuery, size: number, page: number) {
    base.size = size;
    base.from = (page - 1) * size;

    if (query.query) {
      if (!base.query) {
        base.query = {};
      }

      if (!base.query.bool) {
        base.query.bool = {};
      }

      if (!base.query.bool.must) {
        base.query.bool.must = [];
      }

      base.query.bool.must.push({query_string: {query: query.query}});
    }

    if (query.sort && typeof query.sort === 'string') {
      base.sort = query.sort.split(',').map((sortBy) => {
        const field = sortBy.trim().split(' ');

        return { [field[0]]: { order: field[1] ?? 'asc' } };
      });
    }

    if (!base.sort) {
      base.sort = [];
    }

    base.track_total_hits = true;

    if (query.fields) {
      if (!base._source || typeof base._source === 'boolean') {
        base._source = {};
      }
      if (!base._source.includes) {
        base._source.includes = [];
      }
      base._source.includes.push(...query.fields.split(','))
    } else if (!base._source) {
      base._source = false;
    }

    return base;
  }

  async _search(query: SearchQuery) {
    const size = query.body?.size ?? query.pageSize ?? 20;
    const page = Math.max(
      query.body?.from && size ?
        Math.floor(query.body.from / size) + 1 :
        query.page ?? 1,
      1);

    return await this.search({
      index: query.index,
      body: this.getSearchBody(query.body ?? {}, query, size, page)
    });
  }

  async search(search: SearchRequest) {
    return await this.elasticsearchService.search({...search, allow_no_indices: true, ignore_unavailable: true});
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
