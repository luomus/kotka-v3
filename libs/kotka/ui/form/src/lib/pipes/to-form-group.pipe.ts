import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Pipe({
  name: 'toFormGroup',
})
export class ToFormGroupPipe implements PipeTransform {
  transform(value: unknown): FormGroup {
    if (value instanceof FormGroup) {
      return value;
    }
    throw Error(
      'Incorrect form usage. Input form should instance of FormGroup'
    );
  }
}
