import { Injectable } from '@nestjs/common';
import { BaseExtractorService } from './base-extractor.service';
import { BulkRequest, IndicesIndexSettingsKeys, MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import { ExtractorValueMappingService } from '../mapper/extractor-value-mapping.service';
import { ElasticUnitRow, ElasticIdentification, ElasticIdentificationRow } from '../elastic-document.interface';
import { Identification } from '@kotka/shared/models';
import { identificationSort } from '@kotka/shared/utils';
import { TaxonLinkingService } from '@kotka/api/taxon-linking';
import { AutocompleteExtractorService, ExtractorInterface } from '@kotka/api/elasticsearch';

const open = [
  'infraRank',
  'publicityRestrictions',
  'taxonRank',
]

const removeNewLine = [
  'identificationNotes',
];

const autocomplete = [
  'author',
  'branchLocation',
  'det',
  'detVerbatim',
  'endangeredStatus',
  'genusQualifier',
  'host',
  'identificationNotes',
  'infraAuthor',
  'infraEpithet',
  'sec',
  'speciesQualifier',
  'taxon',
  'taxonVerbatim',
]

@Injectable()
export class IdentificationExtractorService extends BaseExtractorService {
  constructor (
    private readonly autocompleteExtractorService: AutocompleteExtractorService,
    private readonly taxonLinkingService: TaxonLinkingService,
    protected readonly valueMappingService: ExtractorValueMappingService,
  ) {
    super();
    this.open = open;
    this.removeNewLine = removeNewLine;
    this.type = 'identification';
    this.autocompleteFields = autocomplete;
  }

  async addToBulk(document: ElasticUnitRow & { identifications?: Identification[] }, bulk: BulkRequest): Promise<void> {
    if (!document.identifications?.length) {
      return;
    }

    document.identifications = identificationSort(document.identifications);

    const { identifications, ...row } = document;

    let hasPreferred = false;

    for (const identification of identifications) {
      const identificationRow = await this.createIdentificationRow(row, identification, bulk, !hasPreferred);

      this.autocompleteExtractorService.addToBulk(identificationRow, bulk, this.autocompleteFields);

      if (!hasPreferred) {
        hasPreferred = !hasPreferred;
      }
    }

  }

  async createIdentificationRow(parent: ElasticUnitRow, identification: Identification, bulk: BulkRequest, prefered?: boolean) {
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

    const row: ElasticIdentificationRow = {...parent, ...identification, accepted: prefered || false, taxonAndInfra};

    if (identification.taxon) {
      const taxon = await this.taxonLinkingService.getTaxonCached(identification.taxon, identification.author, identification.taxonRank);

      if (taxon) {
        row.acceptedTaxon = taxon[0].scientificName;
        row.taxa = taxon[0].names;
        row.initialLetterOfGenus = taxon[0].scientificName.charAt(0).toUpperCase();

        if (taxon[0].synonyms?.length) {
          row.synonyms = taxon[0].synonyms.map(s => s.scientificName);
        }

        if (taxon[0].family) {
          row.family = taxon[0].family.scientificName;
        }
      }
    }

    await this.extract<ElasticIdentificationRow>(row);

    bulk.body.push(row);

    return row;
  }

  async getTaxonAndInfra(identification: Identification) {
    if (!identification.taxon && !identification.taxonVerbatim) {
      return '';
    }

    let taxon = [identification.taxon || identification.taxonVerbatim];

    if (identification.infraRank) {
      const rank = await this.valueMappingService.getValueMapping(identification.infraRank, 'infraRank');

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
