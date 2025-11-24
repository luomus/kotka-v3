import { Dataset, Document, Organization, Sample, SpecimenTransaction } from '@luomus/laji-schema';
export * from '@luomus/laji-schema';

export type SpecimenDataType = 'botanyspecimen'|'zoospecimen'|'palaeontology'|'accession'|'culture';
export type SpecimenUrlDataType = 'botany'|'zoo'|'palaeontology'|'accession'|'culture';

export const specimenUrlToDataTypeMap: Record<SpecimenUrlDataType, SpecimenDataType> = {
  botany: 'botanyspecimen',
  zoo: 'zoospecimen',
  palaeontology: 'palaeontology',
  accession: 'accession',
  culture: 'culture',
};

export const specimenDataTypeToNameMap: Record<SpecimenDataType, SpecimenUrlDataType> = {
  botanyspecimen: 'botany',
  zoospecimen: 'zoo',
  palaeontology: 'palaeontology',
  accession: 'accession',
  culture: 'culture',
};

export type KotkaDocumentObject =
  | Dataset
  | Document
  | Organization
  | Sample
  | SpecimenTransaction

export enum KotkaDocumentObjectType {
  dataset = 'dataset',
  transaction = 'transaction',
  organization = 'organization',
  sample = 'sample',
  specimen = 'specimen',
}

export interface KotkaDocumentObjectMap {
  [KotkaDocumentObjectType.dataset]: Dataset;
  [KotkaDocumentObjectType.specimen]: Document;
  [KotkaDocumentObjectType.organization]: Organization;
  [KotkaDocumentObjectType.sample]: Sample;
  [KotkaDocumentObjectType.transaction]: SpecimenTransaction;
}

export enum KotkaDocumentObjectFullType {
  dataset = 'GX.dataset',
  transaction = 'HRX.specimenTransaction',
  document = 'MY.document',
  organization = 'MOS.organization',
  sample = 'MF.sample'
}

export const STORE_OBJECTS = [
  KotkaDocumentObjectFullType.dataset,
  KotkaDocumentObjectFullType.organization,
  KotkaDocumentObjectFullType.transaction
];

export interface MultiLanguage {
  en?: string;
  fi?: string;
  sv?: string;
}

export interface StoreVersion {
  version: number;
  created: string;
  patch?: StorePatch[];
}

export interface StorePatch {
  op: 'add'|'replace'|'remove';
  path: string;
  value: any;
}

export interface CoordinateLocationResponse {
  results: CoordinateResults[]
}

export interface CoordinateResults {
  address_components: CoordinateResultAddress[]
  geometry: CoordinateResultGeometry
  formatted_address: string,
  place_id: string,
  types: string[],
}

export interface CoordinateResultAddress {
  long_name: MultiLanguage,
  short_name: MultiLanguage,
  types: string[]
}

interface CoordinateResultGeometry {
  bounds: CoordinateResultBox
  location: CoordinateResultPoint
  location_type: 'string',
  viewport: CoordinateResultBox
}

interface CoordinateResultPoint {
  lat: number,
  lng: number
}

interface CoordinateResultBox {
  northeast: CoordinateResultPoint
  southwest: CoordinateResultPoint
}

export interface KotkaVersionDifference<S extends KotkaDocumentObject = KotkaDocumentObject> {
  original: S;
  patch: StorePatch[];
}

export interface DifferenceObject {
  [key: string]: DifferenceObjectValue;
}
export type DifferenceObjectPatch = Omit<StorePatch, 'path'>;
export type DifferenceObjectValue = DifferenceObject|DifferenceObject[]|DifferenceObjectPatch|DifferenceObjectPatch[];

export interface KotkaVersionDifferenceObject<S extends KotkaDocumentObject = KotkaDocumentObject> {
  original: S;
  diff: DifferenceObject;
}

export function isDifferenceObjectPatch(value: DifferenceObjectValue|undefined|null): value is DifferenceObjectPatch {
  return value !== undefined && value !== null && 'op' in value;
}

export function isMultiLanguageObject(value: any): value is MultiLanguage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const languages = ['en', 'fi', 'sv'];
  const keys = Object.keys(value);
  const hasLanguageKeys = languages.some(lang => keys.includes(lang));
  const hasExtraKeys = keys.some(key => !languages.includes(key));

  return hasLanguageKeys && !hasExtraKeys;
}
