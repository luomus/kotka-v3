import { Injectable } from '@nestjs/common';
import { BaseExtractorService } from './base-extractor.service';
import { ElasticUnitRow, ElasticTypeRow } from '../elastic-document.interface';
import { BulkRequest } from '@elastic/elasticsearch/lib/api/types';
import { TypeSpecimen } from '@luomus/laji-schema/models';
import { ExtractorValueMappingService } from '../mapper/extractor-value-mapping.service';
import { AutocompleteExtractorService, ExtractorInterface } from '@kotka/api/elasticsearch';

const open = [
  'publicityRestrictions',
  'typeStatus',
  'typeVerification',
];

const autocomplete = [
  'typeAuthor',
  'typeBasionymePubl',
  'typeNotes',
  'typePubl',
  'typeSpecies',
  'typeSubspecies',
  'typeSubspeciesAuthor',
  'typif',
]

@Injectable()
export class TypeExtractorService extends BaseExtractorService {
  constructor(
    private readonly autocompleteExtractorService: AutocompleteExtractorService,
    protected readonly valueMappingService: ExtractorValueMappingService,
  ) {
    super();
    this.open = open;
    this.type = 'typespecimen';
    this.autocompleteFields = autocomplete;
  }

  async addToBulk(document: ElasticUnitRow & { typeSpecimens?: TypeSpecimen[] }, bulk: BulkRequest): Promise<void> {
    const { typeSpecimens, ...row } = document;

    if (!typeSpecimens?.length) {
      return;
    }

    for (const typeSpecimen of typeSpecimens) {
      const typeRow = await this.createTypeSpecimenRow(row, typeSpecimen, bulk);

      this.autocompleteExtractorService.addToBulk(typeRow, bulk, this.autocompleteFields);
    }
  }

  async createTypeSpecimenRow(parent: ElasticUnitRow, typeSpecimen: TypeSpecimen, bulk: BulkRequest) {
    if (!bulk.body || !Array.isArray(bulk.body)) {
      bulk.body = [];
    }

    bulk.body.push({
      index: {
        _index: this.getIndex(),
        _id: typeSpecimen.id!,
      }
    });

    const row: ElasticTypeRow = {...parent, ...typeSpecimen, isType: (typeSpecimen.typeStatus && typeSpecimen.typeStatus !== 'MY.typeStatusNo') ? true : false};

    this.extract<ElasticTypeRow>(row);

    bulk.body.push(row);

    return row;
  }

  getRelatedExtracts(): ExtractorInterface[] {
    return [
      this.autocompleteExtractorService,
    ];
  }
}
