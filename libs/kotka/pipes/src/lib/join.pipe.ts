import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'join',
  pure: true
})
export class JoinPipe implements PipeTransform {
  transform(value?: string|string[], sep=', '): string {
    return Array.isArray(value) ? value.join(sep) : value ?? '';
  }
}
