import { Injectable } from '@nestjs/common';
import { BaseExtractorService } from './base-extractor.service';
import { ElasticUnitRow, ElasticSampleRow, ElasticSample, PreparationArrayed, NonPrefixedElasticSample } from '../elastic-document.interface';
import { BulkRequest } from '@elastic/elasticsearch/lib/api/types';
import { Preparation, Sample } from '@kotka/shared/models';
import { ExtractorValueMappingService } from '../mapper/extractor-value-mapping.service';
import { AutocompleteExtractorService, ExtractorInterface } from '@kotka/api/elasticsearch';

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
]
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
]

@Injectable()
export class SampleExtractorService extends BaseExtractorService {
  constructor(
    private readonly autocompleteExtractorService: AutocompleteExtractorService,
    protected readonly valueMappingService: ExtractorValueMappingService,
  ) {
    super();
    this.open = open;
    this.removeNewLine = removeNewLine;
    this.mapOpenedValuesTo = mapOpenedValuesTo;
    this.type = 'sample';
    this.remove = [...this.remove, ...remove];
    this.autocompleteFields = autocomplete;
  }

  getIndex(): string {
    return super.getIndex();
  }

  getMapping() {
    const baseMapping = super.getMapping();
    const sampleProperties: Record<string, any> = {
      'sampleMeasurement': {
        'type': 'object',
      },
      'sampleDocumentURI': {
        'type': 'keyword'
      },
      'sampleDocumentID': {
        'type': 'keyword'
      },
      'sampleDocumentQName': {
        'type': 'keyword'
      },
      'sampleObjectID': {
        'type': 'long',
      },
      'sampleDateCreated': {
        'type': 'date',
        'format': this.FORMAT_DATETIME + '||date||yyyy-MM-dd\'T\'HH:mm:ss||yyyy'
      },
    }

    baseMapping.properties = { ...baseMapping.properties, ...sampleProperties };

    return baseMapping;
  }

  async addToBulk(document: ElasticUnitRow & { samples?: Sample[] }, bulk: BulkRequest): Promise<void> {
    const { samples, ...row } = document;

    if (!samples?.length) {
      return;
    }

    for (const sample of samples) {
      const sampleRow = await this.createSampleRow(row, sample, bulk);

      await this.autocompleteExtractorService.addToBulk(sampleRow, bulk, this.autocompleteFields);
    }
  }

  async createSampleRow(parent: ElasticUnitRow, sample: Sample, bulk: BulkRequest) {
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

    row = {...row, ...this.flattenPreparations(preparations || [])} as NonPrefixedElasticSample;

    await this.extract<NonPrefixedElasticSample>(row);

    const prefixedRow = this.prefixFields(row);

    bulk.body.push({ ...parent, ...prefixedRow });

    return prefixedRow as ElasticSampleRow;
  }

  prefixFields(row: Omit<Sample, 'preparations'>): ElasticSample {
    const newRow: ElasticSample = {};

    for (const key in row) {
      let newKey= (key.startsWith('sample') ? key : `sample${key.charAt(0).toUpperCase()}${key.slice(1)}`) as keyof ElasticSample;

      (newRow[newKey] as any) = row[key as keyof Omit<Sample, 'preparations'>];
    }

    return newRow as ElasticSample;
  }

  flattenPreparations(preparations: Preparation[]): PreparationArrayed {
    const flattened: Record<string, any> = {};

    preparations.forEach((preparation) => {
      Object.keys(preparation).forEach((key) => {
        if (!flattened[key]) {
          flattened[key] = [];
        }

        let value = preparation[key as keyof Preparation];

        if (value === undefined || value === null) {
          return;
        }

        if (Array.isArray(value)) {
          value.forEach(v => {
            if (!flattened[key].includes(v)) {
              flattened[key].push(v);
            }
          });
        } else {
          if (!flattened[key].includes(value)) {
            flattened[key].push(value);
          }
        }
      });
    });

    return flattened as PreparationArrayed;
  }

  getRelatedExtracts(): ExtractorInterface[] {
    return [
      this.autocompleteExtractorService,
    ];
  }
}
