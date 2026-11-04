import {
  ISimpleFilterModel,
  JoinOperator as GridJoinOperator,
} from '@ag-grid-community/core';
import { SearchField, SearchResultKey } from '@kotka/shared/models';

export type JoinOperator = GridJoinOperator;

export type SearchOperator = Exclude<
  ISimpleFilterModel['type'],
  null | undefined | 'empty' | 'notEmpty'
>;

export type SearchOperatorWithNegation = Extract<
  SearchOperator,
  'notEqual' | 'notContains' | 'blank'
>;
export type SearchOperatorWithoutNegation = Exclude<
  SearchOperator,
  SearchOperatorWithNegation
>;

export const isSearchOperatorWithNegation = (
  operator: SearchOperator,
): operator is SearchOperatorWithNegation => {
  return ['notEqual', 'notContains', 'blank'].includes(operator);
};

export interface SearchOperatorInfo {
  id: SearchOperator;
  label: string;
  noValue?: boolean;
  twoValues?: boolean;
}

export interface SearchCriteria<T extends string = string> {
  field: T;
  operator: SearchOperator;
  value: string;
  value2?: string;
}

export interface SearchGroup<T extends string = string> {
  criteria: SearchCriteria<T>[];
  joinOperator: JoinOperator;
}

export interface BuilderQuery<T extends string = string> {
  groups: SearchGroup<T>[];
  joinOperator: JoinOperator;
}

export interface MultiSearchField extends SearchField {
  fields: string[];
  hasRaw?: false;
  autocompleteField?: string;
}

export type SpecimenMultiSearchFieldKey = 'taxonOrSynonyms';

export interface SpecimenMultiSearchField extends MultiSearchField {
  field: SpecimenMultiSearchFieldKey;
  fields: SearchResultKey[];
}

export type SpecimenBuilderQuery = BuilderQuery<SearchResultKey | SpecimenMultiSearchFieldKey>;

export type SpecimenIdQuery = BuilderQuery<SearchResultKey>;

export interface SpecimenIdSearchValue {
  text: string;
  query: SpecimenIdQuery;
}

export interface SpecimenSearchQuery {
  idSearchValue: SpecimenIdSearchValue;
  textSearchQuery: string;
}
