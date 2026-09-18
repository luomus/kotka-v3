import {
  BuilderQuery, JoinOperator,
  SearchCriteria,
  SearchGroup,
  SearchOperator,
} from '../models';
import { SEARCH_OPERATOR_MAP } from '../constants';

export const ESCAPE_CHARACTERS: string[] = [
  '\\',
  '*',
  '?',
  '+',
  '-',
  '&&',
  '||',
  '!',
  '(',
  ')',
  '{',
  '}',
  '[',
  ']',
  '^',
  '>',
  '<',
  '~',
  ':',
  '"',
  '=',
  '/',
  ' ',
];

export function builderQueryToQueryString(query: BuilderQuery): string {
  const results = query.groups
    .map(group => groupToQueryString(group))
    .filter(result => !!result.result);

  if (results.length === 0) {
    return '';
  } else if (results.length === 1) {
    return results[0].result;
  } else {
    return results
      .map((result) =>
        result.hasMultiple ? `(${result.result})` : result.result,
      )
      .join(` ${query.joinOperator} `);
  }
}

export function groupToQueryString(group: SearchGroup): { result: string, hasMultiple: boolean} {
  const results = group.criteria
    .map((criteria) => criteriaToQueryString(criteria))
    .filter((queryString) => !!queryString);

  if (results.length < 2) {
    return { result: results[0] || '', hasMultiple: false };
  } else {
    return { result: results.join(` ${group.joinOperator} `), hasMultiple: true };
  }
}

export function criteriaToQueryString(criteria: SearchCriteria): string {
  const field = criteria.field;

  const operatorInfo = SEARCH_OPERATOR_MAP[criteria.operator];
  const value = escapeFilterString(criteria.operator, criteria.value);

  if (!operatorInfo.noValue && !value) {
    return '';
  }

  if (criteria.operator === 'blank' || criteria.operator === 'notBlank') {
    if (!field) {
      return '';
    }
    let result = `_exists_:${field}`;
    if (criteria.operator === 'blank') {
      result = `NOT ${result}`;
    }
    return result;
  }

  const prefix = field ? `${field}:` : '';

  switch (criteria.operator) {
    case 'contains': {
      return `${prefix}*${value}*`;
    }
    case 'notContains': {
      return `NOT ${prefix}*${value}*`;
    }
    case 'equals': {
      return `${prefix}"${value}"`;
    }
    case 'notEqual': {
      return `NOT ${prefix}"${value}"`;
    }
    case 'startsWith': {
      return `${prefix}${value}*`;
    }
    case 'endsWith': {
      return `${prefix}*${value}`;
    }
    default: {
      throw new Error(
        'Filter type ' + criteria.operator + ' is not supported!',
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

  let escapedChars = ESCAPE_CHARACTERS;
  if (operator === 'equals' || operator === 'notEqual') {
    escapedChars = ['"'];
  }

  escapedChars.forEach((char) => {
    value = value!.split(char).join('\\' + char);
  });

  return value;
}

export function joinQueryStrings(query1: string, query2: string, joinOperator: JoinOperator = 'AND'): string {
  return [query1, query2].filter(Boolean).map(query => `(${query})`).join(` ${joinOperator} `);
}
