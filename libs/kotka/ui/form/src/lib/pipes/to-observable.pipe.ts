import { Pipe, PipeTransform } from '@angular/core';
import { from, isObservable, Observable, of } from 'rxjs';

@Pipe({
  name: 'toObservable',
})
export class ToObservablePipe implements PipeTransform {
  transform<T>(value: Observable<T> | Promise<T> | T): Observable<T> {
    if (isObservable(value)) {
      return value;
    } else if (value && 'then' in value && typeof value.then === 'function') {
      return from(value);
    }
    return of(value as T);
  }
}
