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

type Query = TermQuery|TermsQuery|WildcardQuery|BooleanQuery;

export interface ElasticsearchQuery {
  query: Query;
}
