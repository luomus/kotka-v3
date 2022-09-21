export interface ListResponse<T> {
  '@context': string;
  '@typ': string;
  view: {
    '@id': string;
    '@type': string;
    itemsPerPage: string;
    first: string;
    last: string;
    previous?: string;
    next?: string;
  };
  totalItems: number;
  pageSize: number;
  currentPage: number;
  lastPage: number;
  member: T[];
}
