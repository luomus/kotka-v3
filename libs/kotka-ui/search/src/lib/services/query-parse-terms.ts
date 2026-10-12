import { JoinOperator, SearchOperator } from '../models';
import { getEscapedCharacters, getRemovedCharacters } from './query-stringify';

export type ValueType = Exclude<SearchOperator, 'empty' | 'notEmpty' | 'notEquals' | 'notContains'>;

export type Term = {
  type: 'field';
  value: string;
} | {
  type: 'joinOperator';
  value: JoinOperator;
} | {
  type: 'negation';
  value: 'NOT';
} | {
  type: 'value';
  value: string;
  value2?: string;
  valueType: ValueType
} | {
  type: 'group';
  value: Term[];
};

type TermWithRawValue = Term & {
  rawValue: string;
}

export const getParsedTerms = (text: string): Term[] => {
  return [...parseTerms(text.replace(/\s+/g, ' ').trim())];
};

function* parseTerms(text: string): Generator<Term, void, undefined> {
  let idx = 0;

  while (idx < text.length) {
    const textPart = text.slice(idx);

    if (/^\s/.test(textPart)) {
      idx++;
      continue;
    }

    const { rawValue, ...term } = getNextPart(textPart);
    idx += rawValue.length;
    yield term;
  }
}

function getNextPart(text: string): TermWithRawValue {
  let result = '';
  let unescapedResult = '';
  let escapeNext = false;
  let isGroup = false;
  let nbrOfUnclosedGroups = 0;
  let isExactValue = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '\\' && !escapeNext) {
      if (i === text.length - 1) {
        throw new Error('Query ends with an escape character');
      }
      escapeNext = true;
    } else {
      if (escapeNext) {
        escapeNext = false;
      } else if (isGroup) {
        if (char === '(') {
          nbrOfUnclosedGroups++;
        } if (char === ')') {
          nbrOfUnclosedGroups--;

          if (nbrOfUnclosedGroups === 0) {
            const groupText = result.slice(1);

            const value = getParsedTerms(groupText);
            if (value.length === 0) {
              throw new Error('Contains empty group');
            } else if (value.length === 1 && value[0].type === 'value') {
              return { ...value[0], rawValue: result + char };
            }

            return {
              type: 'group',
              value,
              rawValue: result + char,
            };
          }
        }
      } else if (isExactValue) {
        if (char === '"') {
          result += char;
          return {
            type: 'value',
            value: unescapeValue(result.slice(1, -1), 'equals'),
            rawValue: result,
            valueType: 'equals'
          };
        }
      } else {
        if (['[', '{'].includes(char) && result.length === 0) {
          const match = text.match(/^(([[{])(.+?) TO (.+?)([\]}])).*/);
          if (!match) {
            throw new Error('Invalid range value');
          }

          return {
            type: 'value',
            ...getRangeValue(match[3].trim(), match[4].trim(), match[2] === '[', match[5] === ']'),
            rawValue: match[1],
          };
        } else if (char === '(' && result.length === 0) {
          isGroup = true;
          nbrOfUnclosedGroups++;
        } else if (char === '"' && result.length === 0) {
          isExactValue = true;
        } else if (char === ':') {
          if (!unescapedResult) {
            throw new Error('Field is missing');
          }

          return {
            type: 'field',
            value: unescapedResult,
            rawValue: result + char
          };
        } else if ([' ', '(', '[', '{'].includes(char)) {
          if (result === 'AND') {
            return {
              type: 'joinOperator',
              value: 'AND',
              rawValue: result,
            };
          } else if (result === 'OR') {
            return {
              type: 'joinOperator',
              value: 'OR',
              rawValue: result,
            };
          } else if (result === 'NOT') {
            return {
              type: 'negation',
              value: 'NOT',
              rawValue: result,
            };
          }

          if (!result) {
            throw new Error('Value is missing');
          }

          return {
            type: 'value',
            rawValue: result,
            ...getNormalValue(result)
          };
        }
      }

      unescapedResult += char;
    }

    result += char;
  }

  return { type: 'value', rawValue: result, ...getNormalValue(result) };
}

function getNormalValue(value: string): { value: string, valueType: ValueType } {
  let innerValue = value;
  let valueType: ValueType | undefined = undefined;

  const endsWithUnescapedStar = value.endsWith('*') && !lastCharacterIsEscaped(value);

  if (value.startsWith('*') && endsWithUnescapedStar) {
    innerValue = value.slice(1, -1);
    valueType = 'contains';
  } else if (value.startsWith('*')) {
    innerValue = value.slice(1);
    valueType = 'endsWith';
  } else if (endsWithUnescapedStar) {
    innerValue = value.slice(0, -1);
    valueType = 'startsWith';
  }

  return { value: unescapeValue(innerValue), valueType: valueType || 'equals' };
}

function getRangeValue(value1: string, value2: string, startIsInclusive: boolean, endIsInclusive: boolean): { value: string, value2?: string, valueType: ValueType } {
  value1 = unescapeValue(value1, 'inRange');
  value2 = unescapeValue(value2, 'inRange');

  if (value1 === '*') {
    return { value: value2, valueType: endIsInclusive ? 'lessThanOrEqual' : 'lessThan' };
  }

  if (value2 === '*') {
    return { value: value1, valueType: startIsInclusive ? 'greaterThanOrEqual' : 'greaterThan' };
  }

  if (!startIsInclusive || !endIsInclusive) {
    throw new Error('Exclusive ranges are not supported');
  }

  return { value: value1, value2: value2, valueType: 'inRange' };
}

function unescapeValue(value: string, valueType?: SearchOperator): string {
  const escapedCharacters = getEscapedCharacters(valueType);
  const removedCharacters = getRemovedCharacters(valueType);

  let result = '';
  let escapeNext = false;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === '\\' && !escapeNext && i < value.length - 1) {
      if (i === value.length - 1) {
        throw new Error('Value ends with an escape character');
      }
      escapeNext = true;
    } else {
      if (escapedCharacters.includes(char) && !escapeNext) {
        throw new Error('Contains unescaped special character');
      }
      if (removedCharacters.includes(char)) {
        throw new Error('Contains invalid character');
      }
      escapeNext = false;
      result += char;
    }
  }

  return result;
}

function lastCharacterIsEscaped(value: string): boolean {
  let lastCharIsEscaped = false;
  for (let i = value.length - 2; i >= 0; i--) {
    if (value[i] === '\\') {
      lastCharIsEscaped = !lastCharIsEscaped;
    } else {
      break;
    }
  }
  return lastCharIsEscaped;
}
