import { Injectable } from '@nestjs/common';
import { BaseExtractorService } from './base-extractor.service';
import { ElasticBaseUnit, ElasticType, ElasticTypeRow } from '@kotka/shared/models';
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
];

const remove = [
  'publicityRestrictions'
];

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
    this.remove = [...this.remove, ...remove];
  }

  async addToBulk(document: ElasticBaseUnit & { typeSpecimens?: TypeSpecimen[] }, bulk: BulkRequest): Promise<undefined | ElasticType[]> {
    const { typeSpecimens, ...row } = document;

    if (!typeSpecimens?.length) {
      return;
    }

    const typeRows: ElasticType[] = [];

    for (const typeSpecimen of typeSpecimens) {
      const type = await this.createTypeSpecimenRow(row, typeSpecimen, bulk);

      const typeRow: ElasticTypeRow = { ...row, ...type }

      this.autocompleteExtractorService.addToBulk(typeRow, bulk, this.autocompleteFields);

      typeRows.push(type);
    }

    return typeRows;
  }

  async createTypeSpecimenRow(parent: ElasticBaseUnit, typeSpecimen: TypeSpecimen, bulk: BulkRequest) {
    if (!bulk.body || !Array.isArray(bulk.body)) {
      bulk.body = [];
    }

    bulk.body.push({
      index: {
        _index: this.getIndex(),
        _id: typeSpecimen.id!,
      }
    });

    const row: ElasticType = { ...typeSpecimen, isType: (typeSpecimen.typeStatus && typeSpecimen.typeStatus !== 'MY.typeStatusNo') ? true : false};

    await this.extract<ElasticType>(row);

    bulk.body.push({ ...parent, ...row });

    return row;
  }

  getRelatedExtracts(): ExtractorInterface[] {
    return [
      this.autocompleteExtractorService,
    ];
  }
}
