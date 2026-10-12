import { Injectable } from '@nestjs/common';
import { SpecimenExtractorService } from '../extractor/specimen-extractor.service';
import { EsClientService, AutocompleteExtractorService } from '@kotka/api/elasticsearch';
import { Document, ElasticDocument, IndexType, ElasticIndex } from '@kotka/shared/models';
import { ExtractorFieldMappingService } from '../mapper/extractor-field-mapping.service';

@Injectable()
export class SpecimenSearchService {
  constructor (
    private readonly esClientService: EsClientService,
    private readonly specimenExtractorService: SpecimenExtractorService,
    private readonly autocompleteExtractorService: AutocompleteExtractorService,
    private readonly extractorFieldMappingService: ExtractorFieldMappingService
  ) {}

  async indexSingle(specimen: Document) {
    return await this.esClientService.indexSingle(specimen as ElasticDocument, this.specimenExtractorService);
  }

  async indexMany(specimens: Document[]) {
    return await this.esClientService.indexMany(specimens as ElasticDocument[], this.specimenExtractorService);
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
          }
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
