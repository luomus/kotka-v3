import { Pipe, PipeTransform } from '@angular/core';
import { getDataTypeName } from '../util-services/name-utils';
import { IndexType, KotkaDocumentType } from '@kotka/shared/models';

@Pipe({
  name: 'dataTypeName',
  pure: true,
})
export class DataTypeNamePipePipe implements PipeTransform {
  transform(value?: KotkaDocumentType, capitalize?: boolean, plural?: boolean, indexType?: IndexType): string {
    return value ? getDataTypeName(value, capitalize, plural, indexType) : '';
  }
}
