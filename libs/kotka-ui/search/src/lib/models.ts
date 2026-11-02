import {
  ISimpleFilterModel,
  JoinOperator as GridJoinOperator,
} from '@ag-grid-community/core';
import { SearchField } from '@kotka/shared/models';

export type JoinOperator = GridJoinOperator;

export type SearchOperator = Exclude<
  ISimpleFilterModel['type'],
  null | undefined | 'empty' | 'notEmpty'
>;

export type SearchOperatorWithNegation = Extract<SearchOperator, 'notEqual' | 'notContains' | 'blank'>;
export type SearchOperatorWithoutNegation = Exclude<SearchOperator, SearchOperatorWithNegation>;

export const isSearchOperatorWithNegation = (operator: SearchOperator): operator is SearchOperatorWithNegation => {
  return ['notEqual', 'notContains', 'blank'].includes(operator);
};

export interface SearchOperatorInfo {
  id: SearchOperator;
  label: string;
  noValue?: boolean;
  twoValues?: boolean;
}

export interface SearchCriteria {
  field: string;
  operator: SearchOperator;
  value: string;
  value2?: string;
}

export interface SearchGroup {
  criteria: SearchCriteria[];
  joinOperator: JoinOperator;
}

export interface BuilderQuery {
  groups: SearchGroup[];
  joinOperator: JoinOperator;
}

export interface MultiSearchField extends SearchField {
  fields: string[];
  hasRaw?: false;
  hasAutocomplete?: false;
}
