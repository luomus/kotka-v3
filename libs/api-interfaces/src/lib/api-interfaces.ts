import { Person, StoreObject } from '@kotka/shared/models';
import { HealthCheckResult } from '@nestjs/terminus';

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

export interface StoreVersionDifference {
  original: StoreObject;
  patch: {
    op: 'add'|'replace';
    path: string;
    value: string|number|boolean;
  }[];
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
