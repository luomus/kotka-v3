import { Pipe, PipeTransform } from '@angular/core';
import { SearchCriteria } from '../models';
import { SEARCH_OPERATOR_MAP } from '../constants';

@Pipe({
  name: 'criteriaCanHaveValue',
  pure: true,
})
export class CriteriaCanHaveValuePipe implements PipeTransform {
  transform(value: SearchCriteria): boolean {
    const operatorInfo = SEARCH_OPERATOR_MAP[value.operator];
    return !operatorInfo.noValue;
  }
}
