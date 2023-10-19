import { KotkaDocumentObject } from '@kotka/shared/models';

export enum KotkaDocumentObjectType {
  dataset = 'dataset',
  transaction = 'transaction',
  document = 'document',
  organization = 'organization',
  sample = 'sample'
}

export interface StoreVersion {
  version: number;
  created: string;
}

export interface StorePatch {
  op: 'add'|'replace'|'remove';
  path: string;
  value: string|number|boolean;
}

export interface KotkaVersionDifference {
  original: KotkaDocumentObject;
  patch: StorePatch[];
}

export interface DifferenceObject {
  [key: string]: DifferenceObject|Omit<StorePatch, 'path'>;
}

export interface KotkaVersionDifferenceObject {
  original: KotkaDocumentObject;
  diff: DifferenceObject;
}
