import { Pipe, PipeTransform } from '@angular/core';
import { SearchOperatorInfo } from '../models';
import {
  BOOLEAN_OPERATORS,
  DATE_OPERATORS,
  NUMERIC_OPERATORS,
  TEXT_OPERATORS,
} from '../constants';
import {
  SearchField,
  BOOLEAN_TYPES,
  DATE_TYPES,
  NUMERIC_TYPES,
  TEXT_TYPES,
} from '@kotka/shared/models';

export function getOperatorsForType(type?: string): SearchOperatorInfo[] {
  if (type === undefined || TEXT_TYPES.includes(type)) {
    return TEXT_OPERATORS;
  } else if (BOOLEAN_TYPES.includes(type)) {
    return BOOLEAN_OPERATORS;
  } else if (DATE_TYPES.includes(type)) {
    return DATE_OPERATORS;
  } else if (NUMERIC_TYPES.includes(type)) {
    return NUMERIC_OPERATORS;
  }
  return [];
}

@Pipe({
  name: 'operatorsForField',
  pure: true,
})
export class OperatorsForFieldPipe implements PipeTransform {
  transform(field: string, fieldMap: Record<string, SearchField>): SearchOperatorInfo[] {
    return getOperatorsForType(field ? fieldMap[field]?.type : undefined);
  }
}
