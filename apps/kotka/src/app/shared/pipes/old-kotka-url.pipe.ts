import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'oldKotkaUrl',
  pure: true
})
export class OldKotkaUrlPipe implements PipeTransform {
  transform(value: string|string[] = ''): string|string[] {
    return environment.oldKotkaUrl + value;
  }
}
