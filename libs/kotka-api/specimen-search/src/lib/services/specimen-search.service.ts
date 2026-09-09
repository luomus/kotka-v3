import { Injectable } from '@nestjs/common';
import { SpecimenExtractorService } from '../extractor/specimen-extractor.service';
import { EsClientService, AutocompleteExtractorService } from '@kotka/api/elasticsearch';
import { ElasticDocument } from '../elastic-document.interface';
import { Document } from '@kotka/shared/models';

export type IndexTypes = 'unit' | 'identification' | 'typeSpecimen' | 'sample';

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

  async getIndexedFields(type: IndexTypes) {
    return await this.esClientService.getMappedFields(this.getSearchIndex(type));
  }

  async getAutocompleteSuggestions(field: string, query: string, limit: number) {
    return await this.autocompleteExtractorService.getAutocompleteSuggestion(field, query, limit);
  }

  async getSearchResults(type: IndexTypes, query?: string, pageSize?: number, page?: number, sort?: any, fields?: string, body?: any) {
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

  getSearchIndex(type?: IndexTypes) {
    return type ? `specimen_${type.toLowerCase()}` : 'specimen_unit';
  }
}
