import { Inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'oldKotkaUrl',
  pure: true
})
export class OldKotkaUrlPipe implements PipeTransform {
  private readonly oldKotkaUrl: string;

  constructor(@Inject('oldKotkaUrl') oldKotkaUrl: string) {
    this.oldKotkaUrl = oldKotkaUrl;
  }

  transform(value: string|string[] = ''): string|string[] {
    return this.oldKotkaUrl + value;
  }
}
