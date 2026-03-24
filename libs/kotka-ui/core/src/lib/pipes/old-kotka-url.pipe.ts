import { inject, Pipe, PipeTransform } from '@angular/core';
import { OLD_KOTKA_URL } from '../variables';

@Pipe({
  name: 'oldKotkaUrl',
  pure: true
})
export class OldKotkaUrlPipe implements PipeTransform {
  private readonly oldKotkaUrl = inject(OLD_KOTKA_URL);

  transform(value: string|string[] = ''): string|string[] {
    return this.oldKotkaUrl + value;
  }
}
