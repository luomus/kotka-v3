import { Person } from '@kotka/shared/models';
import { HealthCheckResult } from '@nestjs/terminus';

export interface StoreGetQuery {
  q?: string,
  page?: number,
  page_size?: number,
  sort?: string,
  fields?: string
}

export interface StoreQueryResult<T> {
  '@context': string,
  '@type': string,
  view: {
    '@id': string,
    '@type': string,
    itemsPerPage: string,
    first: string,
    last: string,
    previous: string,
    next: string
  },
  totalItems: number,
  pageSize: number,
  currentPage: number,
  lastPage: number,
  member: T[]
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

export type AutocompleteResult = {
  key: string;
  value: string;
}

export type StatusResponse = HealthCheckResult;
