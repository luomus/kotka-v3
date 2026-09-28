import { Injectable } from '@nestjs/common';
import { SpecimenExtractorService } from '../extractor/specimen-extractor.service';
import { EsClientService, AutocompleteExtractorService } from '@kotka/api/elasticsearch';
import { Document, ElasticDocument, IndexType, ElasticIndex } from '@kotka/shared/models';

@Injectable()
export class SpecimenSearchService {
  constructor (
    private readonly esClientService: EsClientService,
    private readonly specimenExtractorService: SpecimenExtractorService,
    private readonly autocompleteExtractorService: AutocompleteExtractorService,
  ) {}

  async indexSingle(specimen: Document) {
    return await this.esClientService.indexSingle(specimen as ElasticDocument, this.specimenExtractorService);
  }

  async indexMany(specimens: Document[]) {
    return await this.esClientService.indexMany(specimens as ElasticDocument[], this.specimenExtractorService);
  }

  async getIndexedFields(type: IndexType) {
    return await this.esClientService.getMappedFields(this.getSearchIndex(type));
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

  async deleteById(ids: string[]) {
    return await this.esClientService.deleteByQueryString(`_id:(${ids.join(' OR ')})`, this.getSearchIndex());
  }

  async deleteByDocumentQName(qName: string[]) {
    return await this.esClientService.deleteByQueryString(`documentQName:(${qName.join(' OR ')})`, this.getSearchIndex());
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
}
