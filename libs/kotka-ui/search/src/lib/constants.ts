import { keyBy } from 'lodash';
import { SearchOperator, SearchOperatorInfo } from './models';


export const SEARCH_OPERATORS: SearchOperatorInfo[] = [
  { id: 'equals', label: 'Equals' },
  { id: 'notEqual', label: 'Does not equal' },
  { id: 'contains', label: 'Contains' },
  { id: 'notContains', label: 'Does not contain' },
  { id: 'startsWith', label: 'Begins with' },
  { id: 'endsWith', label: 'Ends with' },
  { id: 'greaterThan', label: 'Greater than' },
  { id: 'greaterThanOrEqual', label: 'Greater than or equal' },
  { id: 'lessThan', label: 'Less than' },
  { id: 'lessThanOrEqual', label: 'Less than or equal' },
  { id: 'inRange', label: 'In range', twoValues: true },
  { id: 'blank', label: 'Blank', noValue: true },
  { id: 'notBlank', label: 'Not blank', noValue: true },
];

export const SEARCH_OPERATOR_MAP = <Record<SearchOperator, SearchOperatorInfo>>(
  keyBy(SEARCH_OPERATORS, 'id')
);

const textOperators: SearchOperator[] = [
  'equals',
  'notEqual',
  'contains',
  'notContains',
  'startsWith',
  'endsWith',
  'blank',
  'notBlank',
];
export const TEXT_OPERATORS = SEARCH_OPERATORS.filter((op) =>
  textOperators.includes(op.id)
);

const booleanOperators: SearchOperator[] = [
  'equals',
  'notEqual',
  'blank',
  'notBlank'
];
export const BOOLEAN_OPERATORS = SEARCH_OPERATORS.filter(
  (op) => booleanOperators.includes(op.id)
);

const numericOperators: SearchOperator[] = [
  'equals',
  'notEqual',
  'greaterThan',
  'greaterThanOrEqual',
  'lessThan',
  'lessThanOrEqual',
  'inRange',
  'blank',
  'notBlank',
];
export const NUMERIC_OPERATORS = SEARCH_OPERATORS.filter((op) =>
  numericOperators.includes(op.id)
);

export const TEXT_TYPES: string[] = ['keyword', 'wildcard', 'text'];
export const BOOLEAN_TYPES: string[] = ['boolean'];
export const NUMERIC_TYPES: string[] = ['long', 'integer', 'short', 'byte', 'double', 'float', 'half_float', 'scaled_float', 'unsigned_long', 'date', 'date_nanos'];
export const QUERY_STRING_SUPPORTED_TYPES: string[] = [...TEXT_TYPES, ...BOOLEAN_TYPES, ...NUMERIC_TYPES];
