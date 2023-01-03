import { Person } from '@kotka/shared/models';

export interface StoreGetQuery {
  query?: string,
  page?: number,
  page_size?: number,
  sort?: string,
  fields?: string
}

export interface LoginResponse {
  profile: Person,
  next: string
}
