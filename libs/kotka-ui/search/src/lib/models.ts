import { ISimpleFilterModel, JoinOperator as GridJoinOperator } from '@ag-grid-community/core';

export type JoinOperator = GridJoinOperator;

export type SearchOperator = Exclude<
  ISimpleFilterModel['type'],
  null | undefined
>;

export interface SearchOperatorInfo {
  id: SearchOperator;
  label: string;
  noValue?: boolean;
}

export interface SearchCriteria {
  field: string;
  operator: SearchOperator;
  value: string;
}

export interface SearchGroup {
  criteria: SearchCriteria[];
  joinOperator: JoinOperator;
}

export interface BuilderQuery {
  groups: SearchGroup[];
  joinOperator: JoinOperator;
}
