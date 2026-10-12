import { Pipe, PipeTransform } from '@angular/core';
import { SearchOperatorInfo } from '../models';
import { BOOLEAN_OPERATORS, BOOLEAN_TYPES, NUMERIC_OPERATORS, NUMERIC_TYPES, TEXT_OPERATORS, TEXT_TYPES } from '../constants';

export function getOperatorsForType(type?: string): SearchOperatorInfo[] {
  if (type === undefined || TEXT_TYPES.includes(type)) {
    return TEXT_OPERATORS;
  } else if (BOOLEAN_TYPES.includes(type)) {
    return BOOLEAN_OPERATORS;
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
  transform(field: string, fieldTypes: Record<string, string>): SearchOperatorInfo[] {
    return getOperatorsForType(fieldTypes[field]);
  }
}
