import { Dataset, Document, Organization, Sample, SpecimenTransaction } from '@luomus/laji-schema';
export * from '@luomus/laji-schema';

export type KotkaDocumentObject =
| Dataset
| Document
| Organization
| Sample
| SpecimenTransaction

export enum KotkaDocumentObjectType {
  dataset = 'dataset',
  transaction = 'transaction',
  document = 'document',
  organization = 'organization',
  sample = 'sample'
}

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

export interface KotkaVersionDifference {
  original: KotkaDocumentObject;
  patch: StorePatch[];
}

export interface DifferenceObject {
  [key: string]: DifferenceObjectValue;
}
export type DifferenceObjectPatch = Omit<StorePatch, 'path'>;
export type DifferenceObjectValue = DifferenceObject|DifferenceObject[]|DifferenceObjectPatch|DifferenceObjectPatch[];

export interface KotkaVersionDifferenceObject {
  original: KotkaDocumentObject;
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
