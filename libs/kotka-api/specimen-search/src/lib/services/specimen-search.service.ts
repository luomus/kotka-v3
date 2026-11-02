import { Injectable } from '@nestjs/common';
import { SpecimenExtractorService } from '../extractor/specimen-extractor.service';
import { EsClientService, AutocompleteExtractorService } from '@kotka/api/elasticsearch';
import { Document, ElasticDocument, IndexType, ElasticIndex, ESCAPED_CHARACTERS, KotkaObjectFullType } from '@kotka/shared/models';
import { ExtractorFieldMappingService } from '../mapper/extractor-field-mapping.service';
import { getId, defaultPrefix } from 'libs/shared/utils/src/lib/id-utils';
import { BulkResponse } from '@elastic/elasticsearch/lib/api/types';
import { LajiStoreService } from '@kotka/api/services';
import { lastValueFrom, map } from 'rxjs';

export type SpecimenIndexingOptions = {
  ids?: string[];
  batchSize?: number;
  batchCallback?: (count: number, total: number) => void;
  esErrorCallback?: (error: any) => void;
}

@Injectable()
export class SpecimenSearchService {
  constructor (
    private readonly esClientService: EsClientService,
    private readonly specimenExtractorService: SpecimenExtractorService,
    private readonly autocompleteExtractorService: AutocompleteExtractorService,
    private readonly extractorFieldMappingService: ExtractorFieldMappingService,
    private readonly storeService: LajiStoreService,
  ) {}

  async indexSpecimens(options: SpecimenIndexingOptions) {
    let count = 0;
    let stop = false;

    const { ids, batchSize = 10000, batchCallback, esErrorCallback } = options;

    if (ids?.length === 1) {
      batchCallback?.(0, ids.length);

      try {
        const result = await lastValueFrom(this.storeService.get<Document>(KotkaObjectFullType.document, ids[0]).pipe(map(res => res.data)));

        const esResponse = await this.indexSingle(result);

        if (esResponse.errors) {
          if (esErrorCallback) {
            esErrorCallback(esResponse.items[0]);
          } else {
            console.error('Indexing error: ', esResponse.items[0]);
          }
        }

        return ++count;
      } catch (err) {
        if (err.response?.status === 404) {
          if (esErrorCallback) {
            esErrorCallback({ status: 404, message: `No document found with id: ${ids[0]}` });
          } else {
            console.warn(`No document found with given id`);
          }
          return 0;
        } else {
          throw err;
        }
      }

    } else {
      let page = 1;

      do {
        const results = await lastValueFrom(this.storeService.getAll<Document>(KotkaObjectFullType.document, { q: ids ? `id:(${ids.join(' OR ')})` : undefined, page_size: batchSize, page }).pipe(map(res => res.data)));

        if (results.totalItems === 0) {
          esErrorCallback?.('No documents found to index');
          break;
        }

        const esResponse = await this.indexMany(results.member);

        if (esResponse.errors) {
          if (esErrorCallback) {
            esErrorCallback(esResponse.items.filter(item => item.index.error).map(item => item.index.error));
          } else {
            console.error('Indexing errors: ', esResponse.items.filter(item => item.index.error).map(item => item.index.error));
          }
          break;
        }

        count += results.member.length;
        batchCallback?.(count, ids?.length || results.totalItems);

        if (results.lastPage === page) {
          stop = true;
        }

        page++;

      } while (!stop);
    }

    return count;
  }

  async removeOlderThan(before: Date) {
    await this.esClientService.deleteByQuery({
      index: [...this.getSearchIndex(), this.autocompleteExtractorService.getIndex()].join(','),
      body: {
        query: {
          range: {
            ingest_timestamp: {
              lt: before.toISOString()
            }
          }
        }
      }
    });
  }

  async indexSingle(specimen: Document) {
    const indexRes = await this.esClientService.indexSingle(specimen as ElasticDocument, this.specimenExtractorService);

    if (!indexRes.errors) {
      const id = specimen.id;

      await this.deleteRemovedParts([specimen.id], indexRes);
    }

    return indexRes;
  }

  async indexMany(specimens: Document[], removeDeleted?: boolean) {
    const indexRes = await this.esClientService.indexMany(specimens as ElasticDocument[], this.specimenExtractorService);

    if (!indexRes.errors) {
      const ids = specimens.map(specimen => specimen.id);

      await this.deleteRemovedParts(ids, indexRes);
    }

    return indexRes;
  }

  async deleteRemovedParts(documents: string[], indexResult: BulkResponse ) {
    const indexed: { [key: string]: IndexType } = {};

    indexResult.items?.forEach(item => {
      if (item?.index?._index === this.autocompleteExtractorService.getIndex()) {
        return;
      }

      const index = item?.index?._index!;
      const indexID = item?.index?._id!;

      indexed[indexID] = index as IndexType;
    });

    const found = (await this.findByDocumentQName(documents)).hits.hits.map(item => [item._id, item._index]);
    const orphaned: { id: string, index: IndexType }[] = [];

    found.forEach(([id, index]) => {
      if (!indexed[id]) {
        orphaned.push({ id, index });
      }
    });

    if (orphaned.length > 1) {
      await this.esClientService.deleteByBulk(orphaned);
    } else if (orphaned.length) {
      await this.esClientService.deleteById(orphaned[0].id, orphaned[0].index);
    }
  }

  async getIndexedFields(type: IndexType) {
    const fields = await this.extractorFieldMappingService.getFormFields();

    return await this.esClientService.getMappedFields(this.getSearchIndex(type)).then(res => {
      return res.map(field => {
        let label = fields[field.field]?.label;

        if (field.field.toLowerCase().includes('measurement')) {
          const [parent, child ] = field.field.split('.').slice(-2);

          const parentLabel = fields[parent]?.label;
          const childLabel = fields[child]?.label;

          label = `${parentLabel}: ${childLabel}`;

          return {
            ...field,
            ...fields[parent],
            label,
          };
        }

        if (field.field.includes('relationship')) {
          const [parent, child ] = field.field.split('.').slice(-2);

          const parentLabel = fields[parent]?.label;

          label = `${parentLabel}: ${child.charAt(0).toUpperCase() + child.slice(1)}`;

            return {
            ...field,
            ...fields[parent],
            label,
          };
        }

        const schemaField = fields[field.field];
        if(schemaField) {
          return {
            ...field,
            ...schemaField,
          };
        }

        return field;
      });
    });
  }

  async getAutocompleteSuggestions(field: string, query: string, limit: number) {
    return await this.autocompleteExtractorService.getAutocompleteSuggestion(field, query, limit);
  }

  async getSearchResults(type: IndexType, query?: string, pageSize?: number, page?: number, sort?: any, fields?: string, body?: any) {
    return await this.esClientService._search({
      index: this.getSearchIndex(type),
      query,
      sort,
      body,
      page,
      pageSize,
      fields,
    });
  }

  async deleteByID(id: string, index: string) {
    return await this.esClientService.deleteById(id, index);
  }

  async deleteByIds(ids: string[], indices?: string) {
    return await this.deleteByIdField('_id', ids, indices);
  }

  async deleteByDocumentQNames(qNames: string[], indices?: string) {
    return await this.deleteByIdField('documentQName', qNames, indices);
  }

  async deleteByIdField(field: string, id: string[], index?: string) {
    return await this.esClientService.deleteByQuery({
      index: index ?? this.getSearchIndex().join(','),
      query: `${field}:(${this.mapIds(id).join(' OR ')})`
    });
  }

  async   findByDocumentQName(qName: string[]) {
    return await this.esClientService._search({
      index: this.getSearchIndex().join(','),
      query: `documentQName:(${this.mapIds(qName).join(' OR ')})`,
      fields: 'id',
      pageSize: 1000,
    }, true);
  }

  getSearchIndex(): ElasticIndex[];
  getSearchIndex(type: IndexType): ElasticIndex;
  getSearchIndex(type?: IndexType): ElasticIndex | ElasticIndex[] {
    if (type && type !== undefined) {
      return `specimen_${type.toLowerCase()}` as any;
    } else {
      return ['specimen_unit','specimen_identification','specimen_typespecimen','specimen_sample'] as any;
    }
  }

  mapIds(ids: string[]) {
    ESCAPED_CHARACTERS.forEach(char => {
      ids = ids.map(id => getId(id, true).replace(char, `\\${char}`));
    });
    return ids;
  }
}
