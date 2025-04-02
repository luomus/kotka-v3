import { Injectable } from '@angular/core';
import {
  catchError,
  forkJoin,
  isObservable,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { UserService } from '../user.service';
import { ApiClient } from '../api-client';
import { Collection } from '@luomus/laji-schema/models';
import {
  KotkaDocumentObject,
  KotkaDocumentObjectType,
} from '@kotka/shared/models';
import { JSONPath } from 'jsonpath-plus';

export type ApiLabelType = 'person' | 'organization' | 'collection' | 'dataset';

@Injectable({
  providedIn: 'root',
})
export class ApiLabelService {
  private cache: Record<string, string | Observable<string>> = {};

  constructor(
    private userService: UserService,
    private apiCient: ApiClient,
  ) {}

  getApiLabelType(keys: any): ApiLabelType | undefined {
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
      } else if (key.startsWith('GX.')) {
        return 'dataset';
      }
    }

    return undefined;
  }

  getLabel(key: string, type: ApiLabelType): Observable<string> {
    if (this.cache[key]) {
      return isObservable(this.cache[key])
        ? (this.cache[key] as Observable<string>)
        : of(this.cache[key] as string);
    }

    this.cache[key] = this.fetchLabel(key, type).pipe(
      catchError((e) => {
        if (e?.status === 404) {
          return of(key);
        }
        throw e;
      }),
      tap({
        next: (label) => (this.cache[key] = label),
        error: () => delete this.cache[key],
      }),
      share(),
    );

    return this.cache[key] as Observable<string>;
  }

  getLabels(
    keys: string[],
    type: ApiLabelType,
  ): Observable<Record<string, string>> {
    const result: Record<string, string> = {};

    const validKeys = keys.filter((key) => {
      result[key] = key;
      return this.getApiLabelType(key) === type;
    });

    const { setCachedLabelsToResult$, missingKeys } =
      this.setCachedLabelsToResult(result, validKeys);

    if (missingKeys.length === 0) {
      return setCachedLabelsToResult$.pipe(map(() => result));
    }

    const missingLabels$ = this.fetchAndCacheLabels(missingKeys, type);

    return setCachedLabelsToResult$.pipe(
      switchMap(() => missingLabels$),
      map((missingLabels) => ({ ...result, ...missingLabels })),
    );
  }

  private setCachedLabelsToResult(
    result: Record<string, string>,
    keys: string[],
  ): {
    setCachedLabelsToResult$: Observable<any>;
    missingKeys: string[];
  } {
    const observables: Observable<any>[] = [];

    const missingKeys = keys.filter((key) => {
      if (this.cache[key]) {
        if (isObservable(this.cache[key])) {
          observables.push(
            (this.cache[key] as Observable<any>).pipe(
              tap((label) => (result[key] = label)),
            ),
          );
        } else {
          result[key] = this.cache[key] as string;
        }
        return false;
      }
      return true;
    });

    return {
      setCachedLabelsToResult$:
        observables.length > 0 ? forkJoin(observables) : of([]),
      missingKeys,
    };
  }

  private fetchAndCacheLabels(
    keys: string[],
    type: ApiLabelType,
  ): Observable<Record<string, string>> {
    const labels$ = this.fetchLabels(keys, type).pipe(
      map((labels) => {
        const result: Record<string, string> = {};
        labels.forEach((data) => {
          result[data.key] = data.value;
        });
        return result;
      }),
      shareReplay(1),
    );

    keys.forEach((key) => {
      this.cache[key] = labels$.pipe(
        map((labels) => labels[key] || key),
        tap((result) => {
          this.cache[key] = result;
        }),
      );
    });

    return labels$;
  }

  private fetchLabel(key: string, type: ApiLabelType): Observable<string> {
    let observable: Observable<string>;

    if (type === 'person') {
      observable = this.userService.user$.pipe(
        switchMap((user) => {
          if (user && user.id === key) {
            return of(user.fullName);
          } else {
            return this.apiCient
              .getPerson(key)
              .pipe(map((person) => person.fullName));
          }
        }),
      );
    } else if (type === 'organization') {
      observable = this.apiCient
        .getDocumentById(KotkaDocumentObjectType.organization, key)
        .pipe(map((organization) => organization.fullName?.en || key));
    } else if (type === 'collection') {
      observable = this.apiCient
        .getCollection(key)
        .pipe(map((collection) => collection.collectionName.en || key));
    } else {
      observable = this.apiCient
        .getDocumentById(KotkaDocumentObjectType.dataset, key)
        .pipe(map((dataset) => dataset.datasetName.en || key));
    }

    return observable;
  }

  private fetchLabels(
    keys: string[],
    type: ApiLabelType,
  ): Observable<{ key: string; value: string }[]> {
    if (type === 'person') {
      throw new Error('The method is missing an implementation for persons!');
    } else if (type === 'organization') {
      return this.fetchKotkaDocumentLabels(
        KotkaDocumentObjectType.organization,
        keys,
        'fullName.en',
      );
    } else if (type === 'collection') {
      return this.apiCient.getCollections(keys).pipe(
        map((collections) =>
          collections.map((collection: Collection) => ({
            key: collection.id!,
            value: collection.collectionName.en || collection.id!,
          })),
        ),
      );
    } else {
      return this.fetchKotkaDocumentLabels(
        KotkaDocumentObjectType.dataset,
        keys,
        'datasetName.en'
      );
    }
  }

  private fetchKotkaDocumentLabels(
    type: KotkaDocumentObjectType,
    keys: string[],
    labelField: string,
  ): Observable<{ key: string; value: string }[]> {
    return this.apiCient.getDocumentsById(type, keys, ['id', labelField]).pipe(
      map((docs) =>
        docs.map((doc: Partial<KotkaDocumentObject>) => ({
          key: doc.id!,
          value:
            JSONPath({ path: labelField, json: doc, wrap: false }) || doc.id!,
        })),
      ),
    );
  }
}
