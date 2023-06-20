import { Person } from '@kotka/shared/models';
import { HealthCheckResult } from '@nestjs/terminus';

export interface StoreGetQuery {
  query?: string,
  page?: number,
  page_size?: number,
  sort?: string,
  fields?: string
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
