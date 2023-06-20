import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap, isObservable } from 'rxjs';
import { map, tap, share } from 'rxjs/operators';
import { Person } from '@kotka/shared/models';
import { UserService } from './user.service';
import { lajiApiBase } from './constants';

interface OrganizationResponse {
  fullName: string;
}

const personPath = `${lajiApiBase}/person/by-id/`;
const organizationPath = `${lajiApiBase}/organization/by-id/`;

const cache: Record<string, string|Observable<string>> = {};

@Injectable({
  providedIn: 'root'
})

export class LabelService {
  constructor(
    private userService: UserService,
    private httpClient: HttpClient
  ) {}

  getLabel(id: string): Observable<string> {
    if (!id || !(id.startsWith('MA.') || id.startsWith('MOS.'))) {
      return of(id);
    }

    if (cache[id]) {
      return isObservable(cache[id]) ?
          cache[id] as Observable<string> :
          of(cache[id] as string);
    }

    let observable: Observable<string>;
    if (id.startsWith('MA.')) {
      observable = this.userService.user$.pipe(
        switchMap(user => {
          if (user && user.id === id) {
            return of(user.fullName);
          } else {
            return this.httpClient.get<Person>(personPath + id).pipe(
              map(person => person.fullName)
            );
          }
        })
      );
    } else {
      observable = this.httpClient.get<OrganizationResponse>(organizationPath + id).pipe(
        map(organization => organization.fullName)
      );
    }

    cache[id] = observable.pipe(
      tap({
        next: label => cache[id] = label,
        error: () => delete cache[id]
      }),
      catchError(() => of(id)),
      share()
    );

    return cache[id] as Observable<string>;
  }
}
