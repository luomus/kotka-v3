import { Pipe, PipeTransform } from '@angular/core';
import { Field } from '../viewer/viewer.component';

@Pipe({
  name: 'enum',
  pure: true
})
export class EnumPipe implements PipeTransform {
  transform(value: string, field: Field): string {
    const valueOptions = field.options?.value_options;
    return valueOptions?.[value] || '';
  }
}
