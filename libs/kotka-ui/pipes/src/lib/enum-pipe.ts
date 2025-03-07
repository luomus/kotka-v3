import { Pipe, PipeTransform } from '@angular/core';
import { LajiForm } from '@kotka/shared/models';

@Pipe({
  name: 'enum',
  pure: true,
})
export class EnumPipe implements PipeTransform {
  transform(value: string | undefined, field: LajiForm.Field): string {
    const valueOptions = field.options?.value_options;
    return valueOptions?.[value || ''] || '';
  }
}
