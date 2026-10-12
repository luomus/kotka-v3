import { ExtractorConfig } from "./base.config";

export const typeSpecimenConfig: ExtractorConfig = {
  type: 'typespecimen',
  open:  [
    'publicityRestrictions',
    'typeStatus',
    'typeVerification',
  ],
  remove: [
    'publicityRestrictions'
  ],
  autocompleteFields: [
    'typeAuthor',
    'typeBasionymePubl',
    'typeNotes',
    'typePubl',
    'typeSpecies',
    'typeSubspecies',
    'typeSubspeciesAuthor',
    'typif',
  ],
  hardCodedFields: {
    isType: {
      label: 'Is type specimen',
      level: 'typespecimen',
    },
  }
};
