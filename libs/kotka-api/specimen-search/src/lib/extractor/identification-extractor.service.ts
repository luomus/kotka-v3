import { Injectable } from '@nestjs/common';
import { BaseExtractorService } from './base-extractor.service';
import { BulkRequest } from '@elastic/elasticsearch/lib/api/types';
import { ExtractorFieldMappingService } from '../mapper/extractor-field-mapping.service';
import { ElasticBaseUnit, ElasticIdentification } from '@kotka/shared/models';
import { Identification } from '@kotka/shared/models';
import { identificationSort } from '@kotka/shared/utils';
import { TaxonLinkingService } from '@kotka/api/taxon-linking';
import { AutocompleteExtractorService, ExtractorInterface } from '@kotka/api/elasticsearch';
import { identificationConfig } from './config/identification.config';

@Injectable()
export class IdentificationExtractorService extends BaseExtractorService {
  constructor (
    private readonly autocompleteExtractorService: AutocompleteExtractorService,
    private readonly taxonLinkingService: TaxonLinkingService,
    protected readonly valueMappingService: ExtractorFieldMappingService,
  ) {
    super(valueMappingService, identificationConfig);
  }

  async addToBulk(document: ElasticBaseUnit & { identifications?: Identification[] }, bulk: BulkRequest): Promise<undefined | ElasticIdentification[]> {
    if (!document.identifications?.length) {
      return;
    }

    document.identifications = identificationSort(document.identifications);

    const { identifications, ...row } = document;

    let hasPreferred = false;

    const identificationRows: ElasticIdentification[] = [];

    for (const identification of identifications) {
      const identificationRow = await this.createIdentificationRow(row, identification, bulk, !hasPreferred);

      this.autocompleteExtractorService.addToBulk(identificationRow, bulk, this.config.autocompleteFields);

      if (!hasPreferred) {
        hasPreferred = !hasPreferred;
      }

      identificationRows.push(identificationRow);
    }

    return identificationRows;
  }

  async createIdentificationRow(parent: ElasticBaseUnit, identification: Identification, bulk: BulkRequest, prefered?: boolean) {
    if (!bulk.body || !Array.isArray(bulk.body)) {
      bulk.body = [];
    }

    bulk.body.push({
      index: {
        _index: this.getIndex(),
        _id: identification.id!
      }
    });

    const taxonAndInfra = await this.getTaxonAndInfra(identification);

    const row: ElasticIdentification = { ...identification, accepted: prefered || false, taxonAndInfra};

    if (identification.taxon) {
      const taxon = await this.taxonLinkingService.getTaxonCached(identification.taxon, identification.author, identification.taxonRank);

      if (taxon && taxon.length === 1) {
        row.acceptedTaxon = taxon[0].scientificName;
        row.taxa = taxon[0].names;
        row.initialLetterOfGenus = taxon[0].scientificName.charAt(0).toUpperCase();

        if (taxon[0].synonyms?.length) {
          row.synonyms = taxon[0].synonyms.map(s => s.scientificName);
        }

        if (taxon[0].family) {
          row.family = taxon[0].family.scientificName;
        }

        if (taxon[0].endangeredStatus) {
          row.endangeredStatus = taxon[0].endangeredStatus;
        }
      }
    }

    await this.extract<ElasticIdentification>(row);

    bulk.body.push({ ...parent, ...row });

    return row;
  }

  async getTaxonAndInfra(identification: Identification) {
    if (!identification.taxon && !identification.taxonVerbatim) {
      return '';
    }

    const taxon = [identification.taxon || identification.taxonVerbatim];

    if (identification.infraRank) {
      const rank = await this.valueMappingService.getFieldValueMapping(identification.infraRank, 'infraRank');

      if (rank) {
        taxon.push(rank);
      }
    }

    if (identification.infraEpithet) {
      const infra = identification.infraEpithet;

      if (infra) {
        taxon.push(infra);
      }
    }

    return taxon.join(' ');
  }

  getRelatedExtracts(): ExtractorInterface[] {
    return [
      this.autocompleteExtractorService,
    ];
  }
}
