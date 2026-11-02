import {
  BuilderQuery,
  isSearchOperatorWithNegation,
  JoinOperator,
  MultiSearchField,
  SearchCriteria,
  SearchGroup,
  SearchOperator,
  SearchOperatorWithoutNegation,
} from '../models';
import { getParsedTerms, Term, ValueType } from './query-parse-terms';
import { isEqual, keyBy, uniqWith } from 'lodash';
import { getJoinOperatorForMultiSearchField } from './query-stringify';
import {
  NEGATED_OPERATOR,
  SEARCH_OPERATOR_MAP,
  UNNEGATED_OPERATOR,
} from '../constants';


type TermType = Term['type'] | null;

const groupLevelAllowedPreviousTypes: Record<
  Exclude<TermType, null>,
  TermType[]
> = {
  field: ['joinOperator'],
  joinOperator: ['group'],
  negation: ['joinOperator'],
  value: [],
  group: [null, 'joinOperator'],
};
const criteriaLevelAllowedPreviousTypes: Record<
  Exclude<TermType, null>,
  TermType[]
> = {
  field: [null, 'joinOperator', 'negation'],
  joinOperator: ['value'],
  negation: [null, 'joinOperator'],
  value: [null, 'joinOperator', 'negation', 'field'],
  group: [],
};
const groupLevelAllowedLastTypes: TermType[] = ['group'];
const criteriaLevelAllowedLastTypes: TermType[] = ['value'];

export function queryStringToBuilderQuery(queryString: string, multiFields: MultiSearchField[]): BuilderQuery {
  let terms = getParsedTerms(queryString);
  if (terms.length === 0) {
    return { groups: [], joinOperator: 'AND' };
  }

  const multiFieldByFirstField = keyBy(multiFields, 'fields[0]');
  terms = flattenMultiFieldGroupTerms(terms, multiFieldByFirstField);

  const hasGroups = terms.filter(term => term.type === 'group').length > 0;

  if (hasGroups) {
    return termsToBuilderQuery(terms);
  } else {
    return {
      groups: [termsToSearchGroup(terms)],
      joinOperator: 'AND',
    };
  }
}

function termsToBuilderQuery(terms: Term[]): BuilderQuery {
  const groups: SearchGroup[] = [];
  let joinOperator: JoinOperator | null = null;

  let previousType: TermType = null;
  let i = 0;

  while (i < terms.length) {
    const { type, value } = terms[i];

    if (!groupLevelAllowedPreviousTypes[type].includes(previousType)) {
      throw new Error('Order of the search terms is not valid');
    }

    if (type === 'group') {
      groups.push(termsToSearchGroup(value));
    } else if (type === 'joinOperator') {
      if (joinOperator && joinOperator !== value) {
        throw new Error('Groups should have the same join operator');
      }
      joinOperator = value;
    } else {
      let j = i;
      while (j < terms.length && terms[j].type !== 'joinOperator') {
        j++;
      }
      groups.push(termsToSearchGroup(terms.slice(i, j)));
      previousType = 'group';
      i = j;
      continue;
    }

    previousType = type;
    i++;
  }

  if (!groupLevelAllowedLastTypes.includes(previousType)) {
    throw new Error('Order of the search terms is not valid');
  }

  return { groups, joinOperator: joinOperator || 'AND', };
}

function termsToSearchGroup(terms: Term[]): SearchGroup {
  const criteria: SearchCriteria[] = [];
  let joinOperator: JoinOperator | null = null;

  let currentField = '';
  let currentIsNegated = false;

  let previousType: TermType = null;

  for (const term of terms) {
    const { type, value } = term;

    if (!criteriaLevelAllowedPreviousTypes[type].includes(previousType)) {
      throw new Error('Order of the search terms is not valid');
    }

    if (type === 'field') {
      currentField = value;
    } else if (type === 'value') {
      criteria.push(getCriteria(currentField, value, term.value2, term.valueType, currentIsNegated));
      currentField = '';
      currentIsNegated = false;
    } else if (type === 'joinOperator') {
      if (joinOperator && joinOperator !== value) {
        throw new Error('Criteria should have the same join operator');
      }
      joinOperator = value;
    } else if (type === 'negation') {
      currentIsNegated = true;
    }

    previousType = type;
  }

  if (!criteriaLevelAllowedLastTypes.includes(previousType)) {
    throw new Error('Order of the search terms is not valid');
  }

  return { criteria: criteria, joinOperator: joinOperator || 'AND' };
}

function getCriteria(field: string, value: string, value2: string | undefined, valueType: ValueType, isNegated = false): SearchCriteria {
  let operator: SearchOperator = valueType;

  if (field === '_exists_') {
    if (valueType !== 'equals') {
      throw new Error('Only exact field values are supported for _exists_ operator');
    }

    field = value;
    value = '';
    operator = 'notBlank';
  }

  if (isNegated) {
    const negatedOperator = NEGATED_OPERATOR[operator];
    if (!negatedOperator) {
      throw new Error(`Negation is not supported with "${operator}" operator`);
    }
    operator = negatedOperator;
  }

  const operatorInfo = SEARCH_OPERATOR_MAP[operator];
  if (operatorInfo.noValue && value) {
    throw new Error(`Operator "${operator}" does not support values`);
  } else if (!operatorInfo.noValue && !value) {
    throw new Error(`Operator "${operator}" requires a value`);
  } else if (operatorInfo.twoValues && !value2) {
    throw new Error(`Operator "${operator}" requires two values`);
  }

  return {
    field,
    value,
    value2,
    operator
  };
}

function flattenMultiFieldGroupTerms(
  terms: Term[],
  multiFieldByFirstField: Record<string, MultiSearchField>,
): Term[] {
  let result: Term[] = [];

  for (const term of terms) {
    if (term.type === 'group') {
      let group: SearchGroup | undefined;
      try {
        group = termsToSearchGroup(term.value);
      } catch (e) {
        group = undefined;
      }

      if (group) {
        const multiFieldCriteria = getMatchingMultiFieldCriteria(group, multiFieldByFirstField);
        if (multiFieldCriteria) {
          result = result.concat(criteriaToTerms(multiFieldCriteria));
          continue;
        }
      }

      term.value = flattenMultiFieldGroupTerms(term.value, multiFieldByFirstField);
    }

    result.push(term);
  }

  return result;
}

function getMatchingMultiFieldCriteria(group: SearchGroup, multiFieldByFirstField: Record<string, MultiSearchField>): SearchCriteria | undefined {
  const { criteria, joinOperator } = group;
  const fields = criteria.map((c) => c.field);
  const multiFieldCandidate = multiFieldByFirstField[fields[0]];

  if (isEqual(fields, multiFieldCandidate?.fields)) {
    const uniqueMultiFieldCriteria = uniqWith(
      criteria.map((c) => ({
        ...c,
        field: multiFieldCandidate.field,
      })),
      isEqual,
    );

    if (uniqueMultiFieldCriteria.length === 1) {
      const multiFieldCriteria = uniqueMultiFieldCriteria[0];
      if (joinOperator === getJoinOperatorForMultiSearchField(multiFieldCriteria.operator)) {
        return multiFieldCriteria;
      }
    }
  }

  return undefined;
}

function criteriaToTerms(criteria: SearchCriteria): Term[] {
  const result: Term[] = [];

  const { field, operator, value, value2 } = criteria;

  let operatorWithoutNegation: SearchOperatorWithoutNegation;
  if (isSearchOperatorWithNegation(operator)) {
    result.push({
      type: 'negation',
      value: 'NOT',
    });

    operatorWithoutNegation = UNNEGATED_OPERATOR[operator];
  } else {
    operatorWithoutNegation = operator;
  }

  if (operatorWithoutNegation === 'notBlank') {
    result.push({
      type: 'field',
      value: '_exists_',
    });
    result.push({
      type: 'value',
      value: field,
      valueType: 'equals',
    });
    return result;
  }

  result.push({
    type: 'field',
    value: field,
  });
  result.push({
    type: 'value',
    value,
    value2,
    valueType: operatorWithoutNegation,
  });
  return result;
}
