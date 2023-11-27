import { Pipe, PipeTransform } from '@angular/core';
import { IdService } from '../services/id.service';

@Pipe({
  name: 'toFullUri'
})
export class ToFullUriPipe implements PipeTransform {
  transform(value: string|undefined): string;
  transform(value: string[]): string[];
  transform(value: string|string[] = ''): string|string[] {
    if (Array.isArray(value)) {
      return value.map(val => this.transform(val));
    }
    return IdService.getUri(value);
  }
}
