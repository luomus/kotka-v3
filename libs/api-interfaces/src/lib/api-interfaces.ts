import { Dataset, KotkaDocumentObject, Person, SpecimenTransaction } from '@kotka/shared/models';
import { HealthCheckResult } from '@nestjs/terminus';

export enum KotkaObjectType {
  dataset = 'dataset',
  transaction = 'transaction'
}

export type KotkaObject<T extends KotkaObjectType> = T extends KotkaObjectType.dataset
  ? Dataset
  : SpecimenTransaction;

export interface StoreGetQuery {
  query?: string,
  page?: number,
  page_size?: number,
  sort?: string,
  fields?: string
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

export enum ErrorMessages {
  deletionTargetInUse = 'Deletion target is in use.'
}

export interface LoginResponse {
  profile: Person,
  next: string
}

export interface RangeResponse {
  status: string;
  items?: string[];
}

export type StatusResponse = HealthCheckResult;
