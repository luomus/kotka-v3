import { Pipe, PipeTransform } from '@angular/core';
import { getUri } from '@kotka/shared/utils';

@Pipe({
  name: 'toFullUri',
})
export class ToFullUriPipe implements PipeTransform {
  transform(value: string | undefined): string;
  transform(value: string[]): string[];
  transform(value: string | string[] = ''): string | string[] {
    if (Array.isArray(value)) {
      return value.map((val) => this.transform(val));
    }
    return getUri(value);
  }
}
