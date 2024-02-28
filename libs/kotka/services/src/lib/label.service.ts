import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap, isObservable } from 'rxjs';
import { map, tap, share } from 'rxjs/operators';
import { UserService } from './user.service';
import { DatePipe } from '@angular/common';
import { ApiClient } from './api-client';
import { getOrganizationFullName } from '@kotka/utils';
import { Organization, Collection } from '@luomus/laji-schema/models';

export type LabelKey = string | number | boolean;

type ApiLabelType = 'person' | 'organization' | 'collection';

const cache: Record<string, string | Observable<string>> = {};

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
    const apiLabelType = this.getApiLabelType(key);
    if (apiLabelType) {
      return this.getLabelFromApi(key as string, apiLabelType);
    } else {
      return of(this.getSimpleLabel(key));
    }
  }

  getMultipleLabelsWithSameType(keys: LabelKey[]): Observable<Record<string, string>> {
    const apiLabelType = this.getApiLabelType(keys);
    if (apiLabelType) {
      return this.getLabelsFromApi(keys as string[], apiLabelType);
    } else {
      return of(keys.reduce((result, key) => {
        result[key + ''] = this.getSimpleLabel(key);
        return result;
      }, {} as Record<string, string>));
    }
  }

  private getSimpleLabel(key: LabelKey): string {
    if (key == null || typeof key === 'number') {
      return key + '';
    }

    if (typeof key === 'boolean') {
      return key ? 'Yes' : 'No';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      return this.datePipe.transform(key, 'dd.MM.YYYY') || key;
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(key)) {
      return this.datePipe.transform(key, 'dd.MM.YYYY HH:mm') || key;
    }

    return key;
  }

  private getLabelFromApi(key: string, type: ApiLabelType): Observable<string> {
    if (cache[key]) {
      return isObservable(cache[key]) ?
        cache[key] as Observable<string> :
        of(cache[key] as string);
    }

    cache[key] = this.fetchLabelFromApi(key, type).pipe(
      catchError((e) => {
        if (e?.status === 404) {
          return of(key);
        }
        throw e;
      }),
      tap({
        next: label => cache[key] = label,
        error: () => delete cache[key]
      }),
      share()
    );

    return cache[key] as Observable<string>;
  }

  private getLabelsFromApi(keys: string[], type: 'person' | 'organization' | 'collection'): Observable<Record<string, string>> {
    const result: Record<string, string> = {};

    const missingKeys = keys.filter(key => !!key).filter(key => {
      if (cache[key] && !isObservable(cache[key])) {
        result[key] = cache[key] as string;
        return false;
      }
      result[key] = key;
      return true;
    });

    if (missingKeys.length === 0) {
      return of(result);
    }

    return this.fetchLabelsFromApi(missingKeys, type).pipe(map(missingLabels => {
      missingLabels.forEach(data => {
        cache[data.key] = data.value;
        result[data.key] = data.value;
      });

      return result;
    }));
  }

  private fetchLabelFromApi(key: string, type: ApiLabelType): Observable<string> {
    let observable: Observable<string>;

    if (type === 'person') {
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
    } else if (type === 'organization') {
      observable = this.apiCient.getOrganization(key).pipe(
        map(organization => getOrganizationFullName(organization))
      );
    } else {
      observable = this.apiCient.getCollection(key).pipe(
        map(collection => collection.collectionName.en || key)
      );
    }

    return observable;
  }

  private fetchLabelsFromApi(keys: string[], type: ApiLabelType): Observable<{ key: string; value: string; }[]> {
    let observable: Observable<{ key: string; value: string; }[]>;

    if (type === 'person') {
      throw new Error('The method is missing an implementation for persons!');
    } else if (type === 'organization') {
      observable = this.apiCient.getOrganizations(keys).pipe(
        map(organizations => (
          organizations.map((organization: Organization) => ({
            key: organization.id!, value: getOrganizationFullName(organization)
          }))
        ))
      );
    } else {
      observable = this.apiCient.getCollections(keys).pipe(
        map(collections => (
          collections.map((collection: Collection) => ({
            key: collection.id!, value: collection.collectionName.en || collection.id!
          }))
        ))
      );
    }

    return observable;
  }

  getApiLabelType(keys: LabelKey|LabelKey[]): ApiLabelType|undefined {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    for (const key of keys) {
      if (key == null) {
        continue;
      }
      if (typeof key !== 'string') {
        return;
      }
      if (key.startsWith('MA.')) {
        return 'person';
      } else if (key.startsWith('MOS.')) {
        return 'organization';
      } else if (key.startsWith('HR.')) {
        return 'collection';
      }
    }

    return;
  }
}
