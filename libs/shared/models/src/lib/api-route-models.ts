import { Image, Pdf, Person } from '@luomus/laji-schema';
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

export enum MediaType {
  pdf = 'pdf',
  images = 'images'
}

interface MediaMap {
  [MediaType.pdf]: Pdf;
  [MediaType.images]: Image;
}

export type Media<T extends MediaType = MediaType> = MediaMap[T];

export interface ApiValidationError {
  errorCode: 'VALIDATION_EXCEPTION';
  details: Record<string, string[]>;
}

export enum ErrorMessages {
  deletionTargetInUse = 'Deletion target is in use.',
  missingIntellectualOwner = 'Missing an intellectualOwner',
  loginRequired = 'Login is required',
  invalidSequenceValueFormat = 'Invalid value format',
  protectedSequencePrefix = 'Given sequence is for internal use only',
  authTokenReuqired = 'Authentication token is required',
}

export interface LoginResult {
  profile: Person,
  next: string
}

export interface RangeResult {
  status: string;
  items?: string[];
}

export type AutocompleteResult = {
  key: string;
  value: string;
}

export type StatusResult = HealthCheckResult;
