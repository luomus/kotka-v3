import { Pipe, PipeTransform } from '@angular/core';
import { DifferenceObjectPatch } from '@kotka/shared/models';

@Pipe({
  name: 'arrayIndexRange',
  pure: true
})
export class ArrayIndexRangePipe implements PipeTransform {
  transform(value?: any[], differenceData?: DifferenceObjectPatch[]): number[] {
    const arrayLength = Math.max(value?.length || 0, differenceData?.length || 0);
    return Array(arrayLength).fill(undefined).map((x, i) => i);
  }
}
