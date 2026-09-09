import { Document, Gathering, Identification, Sample, TypeSpecimen, Unit, Measurement, Preparation } from '@luomus/laji-schema/models';

type StoreKeys = 'isPartOf' | '@type' | '@context';
type EsIdFields = {
  documentURI: string;
  documentID: string;
  documentQName: string;
  domain: string;
  namespace: string;
  objectID: number;
};

type AsArray<T> = T extends Array<any> ? T : (T extends undefined ? T : T[]);
type WithAutocompleteFields<T> = T & {
  [k in keyof T as NonNullable<T[k]> extends string | string[] ? `${string & k}_auto_${number}` : never]?: string[];
}

export type EsMeasurement = Omit<Measurement, StoreKeys | 'id'>;

export type MeasurementsStrings = {
  [k in keyof EsMeasurement]?: string[];
}

export type PreparationArrayed = {
  [k in Exclude<keyof Preparation, StoreKeys> as k]?: AsArray<Preparation[k]>;
};

export type ElasticDocument  = Omit<Document, StoreKeys> & {
  gatheringCount: number;
  unitCount: number;
  documentNotes?: string;
  collectionTree?: string[];//TODO CHECK
  relationship?: string[];
  boldID?: string[];
  boldDescription?: string[];
  genbankID?: string[];
  genbankDescription?: string[];
  hasPicture?: boolean;
  pictureCount?: number;
  dataset?: string;
  collection?: string;
  ownerID?: string;
  acquiredFromOrganizationID?: string;
} & EsIdFields;

export interface ElasticGathering extends Omit<Gathering, StoreKeys> {
  gatheringNotes?: string;
  wgs84Location?: { lat: number; lon: number };
}

export type ElasticUnit = Omit<Unit, StoreKeys> & {
  sampleExists: boolean;
  sampleCount: number;
  unitNotes?: string;
  identificationCount: number;
  typeCount: number;
  firstInDocument?: boolean;
  measurement?: MeasurementsStrings;
}

export interface ElasticIdentification extends Omit<Identification, StoreKeys> {
  taxonAndInfra: string;
  accepted: boolean;
  identificationNotes?: string;
  taxa?: string[];
  acceptedTaxon?: string;
  endangeredStatus?: string;
  synonyms?: string[];
  family?: string;
  initialLetterOfGenus?: string;
}

export interface ElasticType extends Omit<TypeSpecimen, StoreKeys> {
  isType: boolean;
}

export interface ElasticBranch {
  branchLocationTree?: string[];
  branchLocationID?: string[];
  branchLocation?: string[];
  branchExistsInLocationID?: string[];
  branchExistsInLocation?: string[];
  branchID?: string[];
  branchSubLocation?: string[];
  branchNotes?: string[];
  branchExists?: boolean;
}

export type ElasticSample =
  Pick<NonPrefixedElasticSample, keyof NonPrefixedElasticSample & `sample${string}`> & {
    [k in keyof Omit<NonPrefixedElasticSample, `sample${string}`> as `sample${Capitalize<string & k>}`]?: NonPrefixedElasticSample[k];
  };

export type NonPrefixedElasticSample = Omit<Sample, StoreKeys> & PreparationArrayed & EsIdFields & {
  measurement?: MeasurementsStrings;
};

export type ElasticDocumentRow = (ElasticUnitRow | ElasticIdentificationRow | ElasticTypeRow | ElasticSampleRow)

export type ElasticUnitRow = WithAutocompleteFields<Omit<ElasticDocument, 'gatherings'> & Omit<ElasticGathering, 'units'> & Omit<ElasticUnit, 'identifications' | 'typeSpecimens' | 'samples'>>;
export type ElasticIdentificationRow = ElasticUnitRow & WithAutocompleteFields<ElasticIdentification>;
export type ElasticTypeRow = ElasticUnitRow & WithAutocompleteFields<ElasticType>;
export type ElasticSampleRow = ElasticUnitRow & WithAutocompleteFields<ElasticSample>;
