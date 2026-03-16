import { Pipe, PipeTransform } from '@angular/core';
import { LajiForm } from '@kotka/shared/models';
import { getEnumValue } from '../util-services/utils';

@Pipe({
  name: 'enum',
  pure: true,
})
export class EnumPipe implements PipeTransform {
  transform(value: string | undefined, field: LajiForm.Field, fieldType?: 'json'): string
  transform(value: string | undefined, field: any, fieldType: 'schema'): string
  transform(value: string | undefined, field: any, fieldType: 'json'|'schema' = 'json'): string {
    return getEnumValue(value, field, fieldType);
  }
}
