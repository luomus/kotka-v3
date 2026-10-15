import { ExtractorConfig } from './base.config';

export const specimenConfig: ExtractorConfig = {
  open: [
    'acquiredFromOrganization',
    'collectionID',
    'coordinateSource',
    'coordinateSystem',
    'creator',
    'datasetID',
    'earliestEpochOrLowestSeries',
    'editor',
    'fruitType',
    'georeferenceSource',
    'latestEpochOrHighestSeries',
    'lifeStage',
    'microbiologicalRiskGroup',
    'owner',
    'plantStatusCode',
    'preservation',
    'projectId',
    'provenance',
    'publicityRestrictions',
    'recordBasis',
    'recordParts',
    'samplingMethod',
    'seedMaturity',
    'seedMorphology',
    'sex',
    'status',
  ],
  mapOpenedIdsTo: {
    'owner': 'ownerID',
    'acquiredFromOrganization': 'acquiredFromOrganizationID'
  },
  mapOpenedValuesTo: {
    'datasetID': 'dataset',
    'collectionID': 'collection',
  },
  remove: [
    'gatherings',
    'gatheringEvent',
    'units',
    'identifications',
    'typeSpecimens',
    'samples',
    'notes',
  ],
  removeNewLine: [
    'localityVerbatim',
    'localityDescription',
    'labelsVerbatim',
    'editNotes',
    'documentNotes',
    'gatheringNotes',
    'unitNotes',
    'identificationNotes',
    'sampleHistory',
  ],
  keyValueFields: {
    'relationship': ':'
  },
  autocompleteFields: [
    'acquiredFrom',
    'administrativeProvince',
    'age',
    'biologicalProvince',
    'boldDescription',
    'chemistry',
    'cladVerbatim',
    'collection',
    'coordinateNotes',
    'coordinatesVerbatim',
    'country',
    'county',
    'creator',
    'dataset',
    'dataSource',
    'datatype',
    'documentLocation',
    'documentNotes',
    'editNotes',
    'editor',
    'entered',
    'exsiccatum',
    'gatheringNotes',
    'genbankDescription',
    'habitatClassification',
    'habitatDescription',
    'higherGeography',
    'labelsVerbatim',
    'language',
    'leg',
    'legID',
    'legVerbatim',
    'locality',
    'localityDescription',
    'localityVerbatim',
    'municipality',
    'populationAbundance',
    'preparations',
    'primaryDataLocation',
    'publication',
    'sampleHistory',
    'digitisers',//mapped from old transcribers
    'unitNotes',
  ],
  hardCodedFields: {
      documentURI: {
        label: 'Document URI',
        level: 'document',
      },
      documentID: {
        label: 'Document ID without domain',
        level: 'document',
      },
      documentQName: {
        label: 'Document QName',
        level: 'document',
      },
      domain: {
        label: 'Document domain',
        level: 'document',
      },
      namespace: {
        label: 'Document namespace',
        level: 'document',
      },
      objectID: {
        label: 'Document ID numerical part',
        level: 'document',
      },
      id: {
        label: 'Document ID',
        level: 'document',
      },
      gatheringCount: {
        label: 'Gathering count',
        level: 'document',
      },
      unitCount: {
        label: 'Unit count',
        level: 'gathering',
      },
      documentNotes: {
        label: 'Document notes',
        level: 'document',
      },
      collectionTree: {
        label: 'Collection tree',
        level: 'document',
      },
      relationship: {
        label: 'Relationship',
        level: 'document',
      },
      boldID: {
        label: 'BOLD ID',
        level: 'document'
      },
      boldDescription: {
        label: 'BOLD description',
        level: 'document',
      },
      genbankID: {
        label: 'GenBank ID',
        level: 'document',
      },
      genbankDescription: {
        label: 'GenBank description',
        level: 'document',
      },
      hasPicture: {
        label: 'Has picture',
        level: 'document',
      },
      pictureCount: {
        label: 'Picture count',
        level: 'document',
      },
      datasetID: {
        label: 'Tag IDs',
        level: 'document',
      },
      collectionID: {
        label: 'Collection ID',
        level: 'document',
      },
      ownerID: {
        label: 'ID of owner of record',
        level: 'document',
      },
      acquiredFromOrganizationID: {
        label: 'ID of organization acquired from',
        level: 'document',
      },
      gatheringNotes: {
        label: 'Gathering notes',
        level: 'gathering',
      },
      wgs84Location: {
        label: 'WGS84 location',
        level: 'gathering',
      },
      sampleExists: {
        label: 'Sample exists',
        level: 'unit',
      },
      sampleCount: {
        label: 'Sample count',
        level: 'unit',
      },
      unitNotes: {
        label: 'Unit notes',
        level: 'unit',
      },
      identificationCount: {
        label: 'Identification count',
        level: 'unit',
      },
      typeCount: {
        label: 'Type count',
        level: 'unit',
      },
      firstInDocument: {
        label: 'First unit in document',
        level: 'unit',
      },
  }
};
