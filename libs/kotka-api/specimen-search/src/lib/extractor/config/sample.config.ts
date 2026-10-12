import { ExtractorConfig } from './base.config';

export const sampleConfig: ExtractorConfig = {
  type: 'sample',
  open:  [
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
  ],
  mapOpenedIdsTo: {},
  mapOpenedValuesTo: {
    'datasetID': 'dataset',
    'collectionID': 'collection',
  },
  remove: [
    'preparations',
    'publicityRestrictions'
  ],
  removeNewLine: [
    'sampleHistory',
  ],
  keyValueFields: {},
  autocompleteFields: [
    'sampleDataset',
    'sampleCollection',
  ],
  elasticMapping: {
    properties: {
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
        'format': 'yyyy-MM-dd\'T\'HH:mm:ss||date||yyyy-MM-dd\'T\'HH:mm:ss||yyyy'
      },
    },
  },
  hardCodedFields: {
    sampleDocumentURI: {
      label: 'Sample URI',
      level: 'sample',
    },
    sampleDocumentID: {
      label: 'Sample ID without domain',
      level: 'sample',
    },
    sampleDocumentQName: {
      label: 'Sample QName',
      level: 'sample',
    },
    sampleDomain: {
      label: 'Sample domain',
      level: 'sample',
    },
    sampleNamespace: {
      label: 'Sample namespace',
      level: 'sample',
    },
    sampleObjectID: {
      label: 'Sample ID numerical part',
      level: 'sample',
    },
    sampleID: {
      label: 'Sample ID',
      level: 'sample',
    },
    sampleMeasurement: {
      label: 'Sample measurement',
      level: 'sample',
    },
    sampleNotes: {
      label: 'Sample notes',
      level: 'sample',
    }
  }
};
