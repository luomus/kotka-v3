import {
  BuilderQuery,
  isSearchOperatorWithNegation,
  JoinOperator,
  MultiSearchField,
  SearchCriteria,
  SearchGroup,
  SearchOperator,
} from '../models';
import { SEARCH_OPERATOR_MAP } from '../constants';
import { ESCAPED_CHARACTERS } from '@kotka/shared/models';

const EQUALS_OPERATORS: SearchOperator[] = ['equals', 'notEqual'];
const RANGE_OPERATORS: SearchOperator[] = ['greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual', 'inRange'];

export const REMOVED_CHARACTERS: string[] = ['>', '<'];

export function builderQueryToQueryString(
  query: BuilderQuery | null,
  multiFieldMap: Record<string, MultiSearchField> = {},
): string {
  if (!query) {
    return '';
  }

  const results = query.groups
    .map(group => groupToQueryString(group, multiFieldMap))
    .filter(result => !!result);

  if (results.length === 0) {
    return '';
  } else if (results.length === 1) {
    return results[0];
  } else {
    return results
      .map(result => `(${result})`)
      .join(` ${query.joinOperator} `);
  }
}

function groupToQueryString(
  group: SearchGroup,
  multiFieldMap: Record<string, MultiSearchField> = {},
): string {
  const results = group.criteria
    .map((criteria) => criteriaToQueryString(criteria, multiFieldMap))
    .filter((queryString) => !!queryString);

  if (results.length === 0) {
    return '';
  } else if (results.length === 1) {
    return results[0];
  } else {
    return results.join(` ${group.joinOperator} `);
  }
}

function criteriaToQueryString(
  criteria: SearchCriteria,
  multiFieldMap: Record<string, MultiSearchField> = {},
): string {
  const multiField = multiFieldMap[criteria.field];

  if (!multiField) {
    return basicCriteriaToQueryString(criteria);
  }

  const results = multiField.fields
    .map((field) => basicCriteriaToQueryString({ ...criteria, field }))
    .filter((queryString) => !!queryString);

  if (results.length === 0) {
    return '';
  } else if (results.length === 1) {
    return results[0];
  } else {
    const joinOperator = getJoinOperatorForMultiSearchField(criteria.operator);
    return `(${results.join(` ${joinOperator} `)})`;
  }
}

function basicCriteriaToQueryString(criteria: SearchCriteria): string {
  const field = criteria.field;

  const operatorInfo = SEARCH_OPERATOR_MAP[criteria.operator];
  const value = escapeFilterString(criteria.operator, criteria.value);
  const value2 = escapeFilterString(criteria.operator, criteria.value2);

  if (!operatorInfo.noValue && !value) {
    return '';
  }

  let queryString = getQueryStringBase(criteria.operator, field, value, value2);
  if (queryString && isSearchOperatorWithNegation(criteria.operator)) {
    queryString = `NOT ${queryString}`;
  }
  return queryString;
}

function getQueryStringBase(
  operator: SearchOperator,
  field: string,
  value: string,
  value2?: string,
): string {
  const prefix = field ? `${field}:` : '';

  switch (operator) {
    case 'notBlank':
    case 'blank':
      return field ? `_exists_:${field}` : '';
    case 'contains':
    case 'notContains':
      return `${prefix}*${value}*`;
    case 'equals':
    case 'notEqual':
      return `${prefix}"${value}"`;
    case 'startsWith':
      return `${prefix}${value}*`;
    case 'endsWith':
      return `${prefix}*${value}`;
    case 'greaterThan':
      return `${prefix}{${value} TO *}`;
    case 'greaterThanOrEqual':
      return `${prefix}[${value} TO *]`;
    case 'lessThan':
      return `${prefix}{* TO ${value}}`;
    case 'lessThanOrEqual':
      return `${prefix}[* TO ${value}]`;
    case 'inRange':
      return `${prefix}[${value} TO ${value2}]`;
    default: {
      throw new Error(
        'Filter type ' + operator + ' is not supported!',
      );
    }
  }
}

export function escapeFilterString(
  operator: SearchOperator,
  value?: string | null,
): string {
  if (!value) {
    return '';
  }

  const escapedChars = getEscapedCharacters(operator);
  const removedChars = getRemovedCharacters(operator);

  escapedChars.forEach((char) => {
    value = value!.split(char).join('\\' + char);
  });

  removedChars.forEach((char) => {
    value = value!.split(char).join('');
  });

  return value;
}

export function getEscapedCharacters(operator?: SearchOperator): string[] {
  if (!operator) {
    return ESCAPED_CHARACTERS;
  } else if (EQUALS_OPERATORS.includes(operator)) {
    return ['\\', '"'];
  } else if (RANGE_OPERATORS.includes(operator)) {
    return ['\\'];
  } else {
    return ESCAPED_CHARACTERS;
  }
}

export function getRemovedCharacters(operator?: SearchOperator): string[] {
  if (!operator) {
    return REMOVED_CHARACTERS;
  } else if (EQUALS_OPERATORS.includes(operator)) {
    return [];
  } else if (RANGE_OPERATORS.includes(operator)) {
    return [']', '}'];
  } else {
    return REMOVED_CHARACTERS;
  }
}

export function getJoinOperatorForMultiSearchField(
  operator: SearchOperator,
): JoinOperator {
  if (isSearchOperatorWithNegation(operator)) {
    return 'AND';
  } else {
    return 'OR';
  }
}
