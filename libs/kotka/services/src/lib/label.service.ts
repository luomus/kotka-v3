import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap, isObservable } from 'rxjs';
import { map, tap, share } from 'rxjs/operators';
import { UserService } from './user.service';
import { DatePipe } from '@angular/common';
import { ApiClient } from './api-client';

export type LabelKey = string|number|boolean;

const cache: Record<string, string|Observable<string>> = {};

@Injectable({
  providedIn: 'root'
})

export class LabelService {
  constructor(
    private userService: UserService,
    private apiCient: ApiClient,
    private datePipe: DatePipe
  ) {}

  getLabel(key: LabelKey): Observable<string> {
    if (key == null || typeof key === 'number') {
      return of(key + '');
    }

    if (typeof key === 'boolean') {
      return of(key ? 'Yes' : 'No');
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      return of(this.datePipe.transform(key, 'dd.MM.YYYY') || key);
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(key)) {
      return of(this.datePipe.transform(key, 'dd.MM.YYYY HH:mm') || key);
    }


    return this.getLabelFromApi(key);
  }

  private getLabelFromApi(key: string): Observable<string> {
    if (!/^(MA)|(MOS)\.\d+$/.test(key)) {
      return of(key);
    }

    if (cache[key]) {
      return isObservable(cache[key]) ?
        cache[key] as Observable<string> :
        of(cache[key] as string);
    }

    let observable: Observable<string>;
    if (key.startsWith('MA.')) {
      observable = this.userService.user$.pipe(
        switchMap(user => {
          if (user && user.id === key) {
            return of(user.fullName);
          } else {
            return this.apiCient.getPerson(key).pipe(
              map(person => person.fullName)
            );
          }
        })
      );
    } else {
      observable = this.apiCient.getOrganization(key).pipe(
        map(organization => organization.fullName)
      );
    }

    cache[key] = observable.pipe(
      tap({
        next: label => cache[key] = label,
        error: () => delete cache[key]
      }),
      catchError(() => of(key)),
      share()
    );

    return cache[key] as Observable<string>;
  }
}
