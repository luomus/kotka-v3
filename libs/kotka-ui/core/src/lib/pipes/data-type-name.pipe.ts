import { Pipe, PipeTransform } from '@angular/core';
import { getDataTypeName } from '../util-services/name-utils';
import { KotkaRootDocumentType } from '@kotka/shared/models';

@Pipe({
  name: 'dataTypeName',
  pure: true,
})
export class DataTypeNamePipePipe implements PipeTransform {
  transform(value?: KotkaRootDocumentType, capitalize?: boolean, plural?: boolean): string {
    return value ? getDataTypeName(value, capitalize, plural) : '';
  }
}
