import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ExtractorInterface } from './extractor.interface';
import { StoreObject } from '@luomus/laji-schema/models';
import { BulkRequest, IndicesIndexSettings, MappingTypeMapping, SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { ElasticAlias, ElasticIndex, SearchField } from '@kotka/shared/models';

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
  constructor(
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  async onModuleInit() {
    await this.setIngestPipeline();
  }

  async setIngestPipeline() {
    const pipeline = await this.elasticsearchService.ingest.getPipeline({
      id: 'ingest_timestamp_pipeline',
    }).catch((e) => {
      if (e.statusCode === 404) {
        return undefined;
      }
      throw e;
    });

    if (pipeline) {
      return;
    }

    return await this.elasticsearchService.ingest.putPipeline({
      id: 'ingest_timestamp_pipeline',
      processors: [
        {
          set: {
            field: "_source.ingest_timestamp",
            override: true,
            value: "{{_ingest.timestamp}}"
          }
        }
      ]
    });
  }

  hasSelectedFields(query: SearchQuery): boolean {
    return !!(query.fields || query?.body?._source);
  }

  getSearchBody(base: any, query: SearchQuery, size?: number, page?: number) {
    if (size) base.size = size;
    if (page && size) base.from = (page - 1) * size;

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
      base._source.includes.push(...query.fields.split(','));
    } else if (base._source === undefined) {
      base._source = true;
    }

    return base;
  }

  getResponse(size: number, page: number, query: SearchQuery, res: Record<string, any>) {
    const total = res.hits.total.value ?? 0;
    const lastPage = size > 0 ? Math.ceil(total / size) : 1;

    const members = this.hasSelectedFields(query) ?
      res.hits.hits.map((hit: Record<string, any>) => ({...hit._source, _sort: hit.sort})) ?? [] :
      res.hits.hits.map((hit: Record<string, any>) => hit._id) ?? [];

    return {
      totalItems: total,
      pageSize: size,
      currentPage: page,
      lastPage: lastPage,
      member: members,
      aggregations: res.aggregations ?? {}
    };
  }

  async _search(query: SearchQuery, rawResponse: boolean = false): Promise<Record<string, any>> {
    const size = query.body?.size ?? query.pageSize ?? 20;
    const page = Math.max(
      query.body?.from && size ?
        Math.floor(query.body.from / size) + 1 :
        query.page ?? 1,
      1);

    return await this.search({
      index: query.index,
      body: this.getSearchBody(query.body ?? {}, query, size, page)
    }).then(res => rawResponse ? res : this.getResponse(size, page, query, res));
  }

  async search(search: SearchRequest) {
    return await this.elasticsearchService.search({...search, allow_no_indices: true, ignore_unavailable: true});
  }

  async hasIndex(index: string) {
    return await this.elasticsearchService.indices.exists({
      index
    });
  }

  async deleteIndex(index: ElasticIndex | ElasticAlias) {
    const exists = await this.hasIndex(index);

    if (!exists) return;

    await this.elasticsearchService.indices.delete({
      index,
      allow_no_indices: true,
      ignore_unavailable: true
    });
  }

  async deleteIndices(indices: ElasticIndex[] | ElasticAlias[]) {
    for (const index of indices) {
      await this.deleteIndex(index);
    }
  }

  async createIndex(index: ElasticAlias, mappings: MappingTypeMapping, settings: IndicesIndexSettings) {
    const exists = await this.hasIndex(index);

    if (exists) return;

    await this.elasticsearchService.indices.create({
      index,
      mappings,
      settings
    });
  }

  async prepareIndex(extractor: ExtractorInterface, migrate: boolean = false) {
    const index = extractor.getIndex();

    const [oldAlias, newAlias] = await this.getAliasNames(index);

    if (oldAlias) {
      if (migrate) await this.migrateIndex(index, oldAlias, newAlias, extractor);
    } else {
      await this.createIndex(newAlias, extractor.getMapping(), extractor.getSettings());
      await this.updateAlias(index, oldAlias, newAlias);
    }

    const relatedExtracts = extractor.getRelatedExtracts();

    if (relatedExtracts) {
      for (const relatedExtract of relatedExtracts) {
        await this.prepareIndex(relatedExtract, migrate);
      }
    }
  }

  private async migrateIndex(
    index: ElasticIndex,
    oldAlias: ElasticAlias,
    newAlias: ElasticAlias,
    extractor: ExtractorInterface
  ): Promise<void> {
    try {
      await this.elasticsearchService.indices.putMapping({ index: oldAlias, body: { mapping: extractor.getMapping(), settings: extractor.getSettings() }});
      return;
    } catch (e) {
      // pass
    }

    console.log(`\nNEED TO REINDEX ${index}`);
    await this.deleteIndex(newAlias);
    await this.createIndex(newAlias, extractor.getMapping(), extractor.getSettings());
    await this.elasticsearchService.reindex({
      timeout: '2h',
      refresh: false,
      wait_for_completion: true,
      source: { index: oldAlias },
      dest: { index: newAlias, op_type: 'create' }
      },
      {
        requestTimeout: '2h'
      }
    );
    await this.updateAlias(index, oldAlias, newAlias);
    await this.elasticsearchService.reindex(
    {
      source: { index: oldAlias, query: {
        range: {
          "@timestamp": {
            gte: "now-6h/h"
          }
        }
      }},
      dest: { index: newAlias, op_type: 'create' },
      wait_for_completion: true,
      refresh: false
    },
    {
      requestTimeout: '2h',
    },
    );
    await this.deleteIndex(oldAlias);
  }

  async indexSingle(result: StoreObject, extractor: ExtractorInterface) {
    const bulk: BulkRequest = {};
    await this.prepareIndex(extractor);

    await extractor.addToBulk(result, bulk);

    return await this.executeBulk(bulk);
  }

  async indexMany(results: StoreObject[], extractor: ExtractorInterface) {
    const bulk: BulkRequest = {};
    await this.prepareIndex(extractor);

    for (const result of results) {
      await extractor.addToBulk(result, bulk);
    }

    return await this.executeBulk(bulk);
  }

  async executeBulk(bulk: BulkRequest, refresh: 'wait_for' | 'true' | 'false' = 'wait_for') {
    return await this.elasticsearchService.bulk({...bulk, refresh});
  }

  async deleteById(id: string, index: string, refresh: 'wait_for' | 'true' | 'false' = 'wait_for') {
    return await this.elasticsearchService.delete({
      index,
      id,
      refresh: refresh,
    });
  };

  async deleteByBulk(ids: { id: string, index: string }[]) {
    const bulk: BulkRequest = {};

    for (const { id, index } of ids) {
      if (!bulk.body || !Array.isArray(bulk.body)) {
        bulk.body = [];
      }

      bulk.body.push({ delete: { _index: index, _id: id } });
    }

    return await this.executeBulk(bulk);
  }

  async deleteByQuery(query: any) {
    return await this.elasticsearchService.deleteByQuery({
      index: query.index,
      body: this.getSearchBody(query.body ?? {}, query),
      allow_no_indices: true,
      ignore_unavailable: true,
      refresh: true
    });
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
          await this.executeBulk(bulk);
          bulk = {};
        }
        //TODO Progress bar tracking?
    }

    if (bulk.body?.length) {
      await this.executeBulk(bulk);
    }
  }

  async getMappedFields(index: ElasticIndex) {
    const mapping = Object.values(await this.elasticsearchService.indices.getMapping({
      index,
      allow_no_indices: true,
      ignore_unavailable: true,
    }))[0]?.mappings as MappingTypeMapping;

    if (!mapping) {
      return [];
    }

    const fields: SearchField[] = [];

    this.traverseMapping(mapping, fields);

    return fields;
  }

  traverseMapping(mapping: MappingTypeMapping, path: SearchField[], parent?: string) {
    if (mapping.properties) {
      Object.keys(mapping.properties).forEach(key => {
        const field = mapping.properties![key];

        if (field.type && field.type !== 'object') {
          path.push({ field: parent ? `${parent}.${key}` : key, type: field.type, hasRaw: !!field.fields?.raw });
        } else {
          this.traverseMapping(field as MappingTypeMapping, path, parent ? `${parent}.${key}` : key);
        }
      });
    }
  }

  private updateAlias(
    index: ElasticIndex,
    oldAlias: ElasticAlias | undefined,
    newAlias: ElasticAlias
  ) {
    const oldIndexAction = { remove: { alias: index, index: oldAlias } };

    return this.elasticsearchService.indices.updateAliases({
      actions: [
        ...(oldAlias ? [oldIndexAction] : []),
        { add: { alias: index, index: newAlias, is_write_index: true } },
      ],
    });
  }

  async getAliases(index?: string) {
    return await this.elasticsearchService.indices.getAlias({ index }).catch((e) => {
      if (e.meta.body.status === 404) {
        return {};
      }
      throw e;
    });
  }

  async getAliasNames(index: ElasticIndex): Promise<[ElasticAlias | undefined, ElasticAlias]> {
    const aliases: { [alias: string]: ElasticAlias } = {};
    const body = await this.getAliases(index);

    Object.keys(body).forEach((alias) => {
      aliases[Object.keys(body[alias]?.aliases)[0]] = alias as ElasticAlias;
    });

    if (!aliases[index]) {
      return [undefined, this.getNextFreeIndex(index, 1)];
    }

    const alias = aliases[index].split('_');
    const last = parseInt(alias.pop() as string);

    return [
      aliases[index],
      await this.getNextFreeIndex(index, (last % 2) + 1),
    ];
  }

  getNextFreeIndex(index: ElasticIndex, indexNumber: number): ElasticAlias {
    return `${index}_${indexNumber}`;
  }
}
