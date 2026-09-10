import { keyBy } from 'lodash';
import { SearchOperator, SearchOperatorInfo } from './models';


export const SEARCH_OPERATORS: SearchOperatorInfo[] = [
  { id: 'contains', label: 'Contains' },
  { id: 'notContains', label: 'Does not contain' },
  { id: 'equals', label: 'Equals' },
  { id: 'notEqual', label: 'Does not equal' },
  { id: 'startsWith', label: 'Begins with' },
  { id: 'endsWith', label: 'Ends with' },
  { id: 'blank', label: 'Blank', noValue: true },
  { id: 'notBlank', label: 'Not blank', noValue: true },
];

export const SEARCH_OPERATOR_MAP = <Record<SearchOperator, SearchOperatorInfo>>(
  keyBy(SEARCH_OPERATORS, 'id')
);
