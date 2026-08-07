import { Pipe, PipeTransform } from '@angular/core';
import { capitalize } from 'lodash';

@Pipe({
  name: 'capitalizeFirstLetter',
  pure: true,
})
export class CapitalizeFirstLetterPipe implements PipeTransform {
  transform(value: string | undefined): string | undefined {
    if (!value) {
      return;
    }
    return capitalize(value);
  }
}
