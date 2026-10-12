import { Injectable } from '@nestjs/common';
import { BaseExtractorService } from './base-extractor.service';
import { ElasticSample, NonPrefixedElasticSample, ElasticBaseUnit } from '@kotka/shared/models';
import { BulkRequest } from '@elastic/elasticsearch/lib/api/types';
import { Preparation, Sample } from '@kotka/shared/models';
import { ExtractorFieldMappingService } from '../mapper/extractor-field-mapping.service';
import { AutocompleteExtractorService, ExtractorInterface } from '@kotka/api/elasticsearch';
import { sampleConfig } from './config/sample.config';

const open = [
  'collectionID',
  'creator',
  'datasetID',
  'editor',
  'elutionMedium',
  'material',
  'microbiologicalRiskGroup',
  'owner',
  'preservation',
  'quality',
  'qualityCheckMethod',
  'status',
  'preparationProcess',
  'preparationMaterials',
  'preparationType',
];

const remove = [
  'preparations',
  'publicityRestrictions'
];

const removeNewLine = [
  'sampleHistory',
];

const mapOpenedValuesTo = {
  'datasetID': 'dataset',
  'collectionID': 'collection',
};

const autocomplete: string[] = [
  'sampleDataset',
  'sampleCollection',
];

const sampleProperties: Record<string, any> = {

};

@Injectable()
export class SampleExtractorService extends BaseExtractorService {
  constructor(
    private readonly autocompleteExtractorService: AutocompleteExtractorService,
    protected readonly valueMappingService: ExtractorFieldMappingService,
  ) {
    super(sampleConfig);
  }

  getIndex() {
    return super.getIndex();
  }

  async addToBulk(document: ElasticBaseUnit & { samples?: Sample[] }, bulk: BulkRequest): Promise<undefined | ElasticSample[]> {
    const { samples, ...row } = document;

    if (!samples?.length) {
      return;
    }

    const sampleRows: ElasticSample[] = [];

    for (const sample of samples) {
      const sampleRow = await this.createSampleRow(row, sample, bulk);

      await this.autocompleteExtractorService.addToBulk(sampleRow, bulk, this.config.autocompleteFields);

      sampleRows.push(sampleRow);
    }

    return sampleRows;
  }

  async createSampleRow(parent: ElasticBaseUnit, sample: Sample, bulk: BulkRequest) {
    if (!bulk.body || !Array.isArray(bulk.body)) {
      bulk.body = [];
    }

    bulk.body.push({
      index: {
        _index: this.getIndex(),
        _id: sample.id!,
      }
    });

    const { preparations, ...rest} = sample;

    let row: NonPrefixedElasticSample = {...rest} as NonPrefixedElasticSample;

    this.extractIDs(row);

    row = {...row, ...this.flattenObjectArray<Preparation>(preparations || [])} as NonPrefixedElasticSample;

    await this.extract<NonPrefixedElasticSample>(row);

    const prefixedRow = this.prefixFields(row);

    bulk.body.push({ ...parent, ...prefixedRow });

    return prefixedRow;
  }

  prefixFields(row: Omit<Sample, 'preparations'>): ElasticSample {
    const newRow: ElasticSample = {};

    for (const key in row) {
      const newKey= (key.startsWith('sample') ? key : `sample${key.charAt(0).toUpperCase()}${key.slice(1)}`) as keyof ElasticSample;

      (newRow[newKey] as any) = row[key as keyof Omit<Sample, 'preparations'>];
    }

    return newRow as ElasticSample;
  }

  getRelatedExtracts(): ExtractorInterface[] {
    return [
      this.autocompleteExtractorService,
    ];
  }
}
