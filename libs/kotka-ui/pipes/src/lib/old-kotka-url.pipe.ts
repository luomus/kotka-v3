import { Pipe, PipeTransform, inject } from '@angular/core';

@Pipe({
  name: 'oldKotkaUrl',
  pure: true
})
export class OldKotkaUrlPipe implements PipeTransform {
  private readonly oldKotkaUrl: string;

  constructor() {
    const oldKotkaUrl = inject<string>('oldKotkaUrl' as any);

    this.oldKotkaUrl = oldKotkaUrl;
  }

  transform(value: string|string[] = ''): string|string[] {
    return this.oldKotkaUrl + value;
  }
}
