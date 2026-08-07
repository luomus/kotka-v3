import { Pipe, PipeTransform } from '@angular/core';
import { getDataTypeName } from '../util-services/name-utils';
import { KotkaDocumentObjectType } from '@kotka/shared/models';

@Pipe({
  name: 'dataTypeName',
  pure: true,
})
export class DataTypeNamePipePipe implements PipeTransform {
  transform(value?: KotkaDocumentObjectType, capitalize?: boolean, plural?: boolean): string {
    return value ? getDataTypeName(value, capitalize, plural) : '';
  }
}
