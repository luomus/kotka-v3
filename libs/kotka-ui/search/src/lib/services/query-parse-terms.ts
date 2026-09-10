import { JoinOperator } from '../models';
import { ESCAPE_CHARACTERS } from './query-stringify';

export type ValueType = 'exact' | 'contains' | 'startsWith' | 'endsWith' | undefined;

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
  const getNextPart = (text: string): TermWithRawValue => {
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
            return {
              type: 'value',
              value: result.slice(1),
              rawValue: result + char,
              valueType: 'exact'
            };
          }
        } else {
          if (char === '(' && result.length === 0) {
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
          } else if (char === ' ' || char === '(') {
            if (unescapedResult === 'AND') {
              return {
                type: 'joinOperator',
                value: 'AND',
                rawValue: result,
              };
            } else if (unescapedResult === 'OR') {
              return {
                type: 'joinOperator',
                value: 'OR',
                rawValue: result,
              };
            } else if (unescapedResult === 'NOT') {
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
              ...getValueAndType(result)
            };
          }
        }

        unescapedResult += char;
      }

      result += char;
    }

    return { type: 'value', rawValue: result, ...getValueAndType(result) };
  };

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

function getValueAndType(value: string): { value: string, valueType: Exclude<ValueType, 'exact'> } {
  let innerValue = value;
  let valueType: ValueType = undefined;

  if (value.startsWith('*') && value.endsWith('*')) {
    innerValue = value.slice(1, -1);
    valueType = 'contains';
  } else if (value.startsWith('*')) {
    innerValue = value.slice(1);
    valueType = 'endsWith';
  } else if (value.endsWith('*')) {
    innerValue = value.slice(0, -1);
    valueType = 'startsWith';
  }

  return { value: unescapeValue(innerValue), valueType};
}

function unescapeValue(value: string): string {
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
      if (ESCAPE_CHARACTERS.includes(char) && !escapeNext) {
        throw new Error('Contains unescaped special character');
      }
      escapeNext = false;
      result += char;
    }
  }

  return result;
}
