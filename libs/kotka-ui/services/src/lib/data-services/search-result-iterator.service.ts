import { inject, Injectable } from '@angular/core';
import { KotkaDocumentObject, KotkaDocumentObjectMap, KotkaDocumentObjectType } from '@kotka/shared/models';
import { ApiClient, DocumentListSearchParams } from './api-client';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-webstorage';
import { UserService } from './index';
import { toSignal } from '@angular/core/rxjs-interop';
import { isKeyOfObject } from '../util-services';

export type SearchParams = Pick<DocumentListSearchParams, 'sort'|'searchQueryString'|'searchQueryObject'>;

interface Sort {
  field: string;
  direction: string;
}

@Injectable({
  providedIn: 'root',
})
export class SearchResultIteratorService {
  private storage = inject(LocalStorageService);
  private apiClient = inject(ApiClient);
  private userService = inject(UserService);

  private userId = toSignal(this.userService.user$.pipe(map(user => user?.id)));
  private searchParamsByType: Partial<{ [ T in KotkaDocumentObjectType ]: SearchParams }> = {};

  setSearchParams(type: KotkaDocumentObjectType, searchParams: SearchParams, store = true) {
    this.searchParamsByType[type] = searchParams;
    if (store) {
      this.storage.store(this.getSearchParamsStorageKey(type, this.userId()), searchParams);
    }
  }

  getPrevious<
    T extends KotkaDocumentObjectType,
    S extends KotkaDocumentObjectMap[T],
  >(type: T, data: S): Observable<string | undefined> {
    return this.getFollowingDocument(type, data, true);
  }

  getNext<
    T extends KotkaDocumentObjectType,
    S extends KotkaDocumentObjectMap[T],
  >(type: T, data: S): Observable<string | undefined> {
    return this.getFollowingDocument(type, data);
  }

  private getFollowingDocument<
    T extends KotkaDocumentObjectType,
    S extends KotkaDocumentObjectMap[T],
  >(type: T, data: S, reverse = false): Observable<string | undefined> {
    const searchParams = this.getSearchParams(type, this.userId());
    if (!searchParams || !searchParams.sort) {
      return of(undefined);
    }

    const sorts = this.sortsFromString(searchParams.sort, reverse);
    const sort = this.sortsToString(sorts);

    const searchAfter = this.getSearchAfter(data, sorts);
    const searchQueryObject = { ...searchParams.searchQueryObject || {}, search_after: searchAfter };

    return this.apiClient.getDocumentList(
      type,
      1,
      1,
      sort,
      searchParams.searchQueryString,
      ['id'],
      searchQueryObject
    ).pipe(map(result => {
      return result.member[0]?.id;
    }));
  }

  private sortsFromString(sort: string, reverse = false): Sort[] {
    return sort.split(',').map(sort => {
      const parts = sort.trim().split(' ');

      const field = parts[0];
      let direction = parts[1];
      if (reverse) {
        direction = direction === 'desc' ? 'asc' : 'desc';
      }

      return {field, direction};
    });
  }

  private sortsToString(sorts: Sort[]): string {
    return sorts.map(sort => sort.field + ' ' + sort.direction).join(',');
  }

  private getSearchAfter(data: KotkaDocumentObject, sorts: Sort[]): (string | number | boolean | null)[] {
    return sorts.map(sort => {
      let result = isKeyOfObject(sort.field, data) ? data[sort.field] : undefined;

      if (result == undefined) {
        return null;
      }

      if (typeof result === 'object') {
        throw new Error(`Can't handle field ${sort.field}, handling of array and object fields is not implemented`);
      }

      if (sort.field === 'id') { // TODO determine if the value needs to be in lowercase from es-mapping
        result = result.toLowerCase();
      }

      return result;
    });
  }

  private getSearchParams(type: KotkaDocumentObjectType, userId: string | undefined): SearchParams {
    const result = this.searchParamsByType[type] || this.storage.retrieve(this.getSearchParamsStorageKey(type, userId));
    this.searchParamsByType[type] = result;
    return result;
  }

  private getSearchParamsStorageKey(type: KotkaDocumentObjectType, userId: string | undefined): string {
    if (!userId) {
      throw new Error('Missing user id!');
    }
    return `${type}-table-${userId}-search-params`;
  }
}
