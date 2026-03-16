import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeFirstLetter',
  pure: true,
})
export class CapitalizeFirstLetterPipe implements PipeTransform {
  transform(value: string | undefined): string | undefined {
    if (!value) {
      return;
    }
    return value[0].toUpperCase() + value.slice(1);
  }
}
