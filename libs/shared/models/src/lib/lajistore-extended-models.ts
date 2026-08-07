import {
  Branch,
  Dataset,
  Document,
  Organization,
  SpecimenTransaction,
} from '@luomus/laji-schema';
export * from '@luomus/laji-schema';

export type SpecimenDataType = 'botanyspecimen'|'zoospecimen'|'palaeontology'|'accession'|'culture';
export type SpecimenDataTypeName = 'botany'|'zoo'|'palaeontology'|'accession'|'culture';

export const specimenNameToTypeMap: Record<SpecimenDataTypeName, SpecimenDataType> = {
  botany: 'botanyspecimen',
  zoo: 'zoospecimen',
  palaeontology: 'palaeontology',
  accession: 'accession',
  culture: 'culture',
};

export const specimenTypeToNameMap: Record<SpecimenDataType, SpecimenDataTypeName> = {
  botanyspecimen: 'botany',
  zoospecimen: 'zoo',
  palaeontology: 'palaeontology',
  accession: 'accession',
  culture: 'culture',
};

export type KotkaRootDocument =
  | Dataset
  | Document
  | Organization
  | SpecimenTransaction
  | Branch

export type KotkaMainDocument = Exclude<KotkaRootDocument, Branch>;

export enum KotkaRootDocumentType {
  dataset = 'dataset',
  transaction = 'transaction',
  organization = 'organization',
  specimen = 'specimen',
  branch = 'branch',
}

export type KotkaMainDocumentType = Exclude<
  KotkaRootDocumentType,
  KotkaRootDocumentType.branch
>;

export interface KotkaRootDocumentMap {
  [KotkaRootDocumentType.dataset]: Dataset;
  [KotkaRootDocumentType.specimen]: Document;
  [KotkaRootDocumentType.organization]: Organization;
  [KotkaRootDocumentType.transaction]: SpecimenTransaction;
  [KotkaRootDocumentType.branch]: Branch;
}

export enum KotkaDocumentFullType {
  dataset = 'GX.dataset',
  organization = 'MOS.organization',
  transaction = 'HRX.specimenTransaction',
  transactionEvent = 'HRX.specimenTransactionEvent',
  document = 'MY.document',
  gathering = 'MY.gathering',
  unit = 'MY.unit',
  identification = 'MY.identification',
  type = 'MY.typeSpecimen',
  sample = 'MF.sample',
  preparation = 'MF.preparationClass',
  branch = 'PUU.branch',
  event = 'PUU.event'
}

export const STORE_OBJECTS: KotkaDocumentFullType[] = [
  KotkaDocumentFullType.dataset,
  KotkaDocumentFullType.organization,
  KotkaDocumentFullType.transaction,
  KotkaDocumentFullType.document,
  KotkaDocumentFullType.branch,
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

export interface KotkaVersionDifference<S extends KotkaRootDocument = KotkaRootDocument> {
  original: S;
  patch: StorePatch[];
}

export interface DifferenceObject {
  [key: string]: DifferenceObjectValue;
}
export type Patch = Omit<StorePatch, 'path'>;
export type DifferenceObjectValue = DifferenceObject|DifferenceObject[]|Patch|Patch[];

export interface KotkaVersionDifferenceObject<S extends KotkaRootDocument = KotkaRootDocument> {
  original: S;
  diff: DifferenceObject;
}

export function isPatch(value: DifferenceObjectValue|undefined|null): value is Patch {
  return value !== undefined && value !== null && 'op' in value;
}
export function isPatchArray(value: DifferenceObjectValue|undefined|null): value is Patch[] {
  return Array.isArray(value) && value.some((val: Patch | DifferenceObject) => isPatch(val));
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
