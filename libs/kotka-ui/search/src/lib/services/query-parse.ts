import {
  BuilderQuery,
  JoinOperator,
  SearchCriteria,
  SearchGroup
} from '../models';
import { getParsedTerms, Term, ValueType } from './query-parse-terms';


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


export function queryStringToBuilderQuery(queryString: string): BuilderQuery {
  const terms = getParsedTerms(queryString);
  if (terms.length === 0) {
    return { groups: [], joinOperator: 'AND' };
  }

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
      criteria.push(getCriteria(currentField, value, term.valueType, currentIsNegated));
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

  return { criteria: criteria, joinOperator: joinOperator || 'AND' };
}

function getCriteria(field: string, value: string, valueType: ValueType, isNegated = false): SearchCriteria {
  if (!value) {
    throw new Error('Empty values are not supported');
  }

  if (field === '_exists_') {
    return {
      field: value,
      value: '',
      operator: isNegated ? 'blank' : 'notBlank'
    };
  } else if (valueType === 'contains') {
    return {
      field,
      value,
      operator: isNegated ? 'notContains' : 'contains',
    };
  } else if (valueType === 'endsWith') {
    if (isNegated) {
      throw new Error(
        'Negation is not supported with "ends with" operator',
      );
    }
    return { field, value, operator: 'endsWith' };
  } else if (valueType === 'startsWith') {
    if (isNegated) {
      throw new Error(
        'Negation is not supported with "starts with" operator',
      );
    }
    return { field, value, operator: 'startsWith' };
  } else {
    return { field, value, operator: isNegated ? 'notEqual' : 'equals' };
  }
}
