import { BuilderQuery } from '../models';
import { SearchField } from '@kotka/shared/models';
import { getOperatorsForType } from '../pipes/operators-for-field.pipe';
import { BOOLEAN_TYPES, DATE_TYPES } from '../constants';

export function validateBuilderQueryValues(query: BuilderQuery, fieldMap: Record<string, SearchField>): BuilderQuery {
  query.groups.forEach((group) => {
    group.criteria.forEach((criteria) => {
      const field = fieldMap[criteria.field];
      if (criteria.field && !field) {
        throw new Error(`Unknown field "${criteria.field}"`);
      }

      const operators = getOperatorsForType(field?.type);
      if (!operators.some((operator) => operator.id === criteria.operator)) {
        throw new Error(
          `Operator "${criteria.operator}" is not supported for field "${criteria.field}"`,
        );
      }

      const type = field?.type;
      if (
        BOOLEAN_TYPES.includes(type) &&
        (!isValidBooleanValue(criteria.value) ||
          !isValidBooleanValue(criteria.value2))
      ) {
        throw new Error(
          `Unsupported value for boolean field "${criteria.field}"`,
        );
      }
      if (
        DATE_TYPES.includes(type) &&
        (!isValidDateValue(criteria.value) ||
          !isValidDateValue(criteria.value2))
      ) {
        throw new Error(`Unsupported value for date field "${criteria.field}"`);
      }
    });
  });

  return query;
}

function isValidBooleanValue(value?: string): boolean {
  return !value || ['true', 'false'].includes(value);
}

function isValidDateValue(value?: string): boolean {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
}
