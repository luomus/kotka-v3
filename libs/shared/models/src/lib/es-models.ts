type Value = string|number|boolean;

interface ExtraOptions {
  boost?: number;
}

type Term = { [key: string]: Value };

type TermWithExtra = { [key: string]: { value: Value } & ExtraOptions };

interface Terms {
  [key: string]: Value[];
}

export interface Bool {
  must?: Query[];
  should?: Query[];
  filter?: Query[];
}

export interface TermQuery {
  term: Term|TermWithExtra;
}

export interface TermsQuery {
  terms: Terms & ExtraOptions;
}

export interface WildcardQuery {
  wildcard: Term|TermWithExtra;
}

export interface BooleanQuery {
  bool: Bool;
}

export interface QueryStringQuery {
  query_string: {
    query: string;
  }
}

export interface GeoDistanceQuery {
  geo_distance: {
    distance: number;
    [key: string]: { lat: number; lon: number } | number;
  }
}

export type Query = TermQuery|TermsQuery|WildcardQuery|BooleanQuery|QueryStringQuery|GeoDistanceQuery;

export type Aggs = { [key: string]: {
  terms?: { field: string, size?: number };
  cardinality?: { field: string, precision_threshold?: number };
} };

export interface ElasticsearchQuery {
  query?: Query;
  search_after?: (Value|null)[];
  aggs?: Aggs;
}
