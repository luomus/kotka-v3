type Value = string|number|boolean;

interface ExtraOptions {
  boost?: number;
}

type Term = { [key: string]: Value };

type TermWithExtra = { [key: string]: { value: Value } & ExtraOptions };

interface Terms {
  [key: string]: Value[];
}

interface Bool {
  must?: Query[];
  should?: Query[];
}

interface TermQuery {
  term: Term|TermWithExtra;
}

interface TermsQuery {
  terms: Terms & ExtraOptions;
}

interface WildcardQuery {
  wildcard: Term|TermWithExtra;
}

interface BooleanQuery {
  bool: Bool;
}

interface QueryStringQuery {
  query_string: {
    query: string;
  }
}

type Query = TermQuery|TermsQuery|WildcardQuery|BooleanQuery|QueryStringQuery;

export interface ElasticsearchQuery {
  query?: Query;
  search_after?: (Value|null)[];
}
