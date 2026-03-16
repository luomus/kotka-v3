import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverse',
  pure: true,
})
export class ReversePipe implements PipeTransform {
  transform<T>(value: Array<T> | undefined): Array<T> | undefined {
    return value?.slice().reverse();
  }
}
