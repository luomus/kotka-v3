import { ExtractorConfig } from "./base.config";

export const identificationConfig: ExtractorConfig = {
  type: 'identification',
  open:  [
    'infraRank',
    'publicityRestrictions',
    'taxonRank',
    'endangeredStatus',
  ],
  remove: [
    'publicityRestrictions'
  ],
  removeNewLine: [
    'identificationNotes',
  ],
  autocompleteFields: [
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
  ],
  elasticMapping: {
    properties: {
      accepted: { type: 'boolean' },
    },
  },
  hardCodedFields: {
    taxonAndInfra: {
      label: 'Taxon and infra',
      level: 'identification',
    },
    accepted: {
      label: 'Preferred',
      level: 'identification',
    },
    identificationNotes: {
      label: 'Identification notes',
      level: 'identification',
    },
    taxa: {
      label: 'Taxon tree',
      level: 'identification',
    },
    acceptedTaxon: {
      label: 'Accepted taxon',
      level: 'identification',
    },
    endangeredStatus: {
      label: 'Endangered status',
      level: 'identification',
    },
    synonyms: {
      label: 'Synonyms',
      level: 'identification',
    },
    family: {
      label: 'Family',
      level: 'identification',
    },
    initialLetterOfGenus: {
      label: 'Initial letter of genus',
      level: 'identification',
    },
  }
}
