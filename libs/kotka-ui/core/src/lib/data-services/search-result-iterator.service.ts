import { computed, inject, Injectable } from '@angular/core';
import { IndexType, KotkaDocumentType, TupleUnion } from '@kotka/shared/models';
import { ApiClient, SearchParams } from './api-client';
import { EMPTY, forkJoin, Observable, of, switchMap } from 'rxjs';
import { expand, map, reduce } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-webstorage';
import { UserService } from './index';
import { queryStringToObject } from '../util-services';
import { omit } from 'lodash';

export interface IteratorSearchParams extends Pick<SearchParams, 'searchQuery'> {
  index: IndexType;
  sort: string;
}

export interface DocumentSortData {
  id: string;
  documentURI: string;
  sort: any[];
}

export interface IteratorState {
  previous?: DocumentSortData;
  next?: DocumentSortData;
}

interface IteratorData {
  searchParams: IteratorSearchParams;
  currentData?: DocumentSortData;
  cache: DocumentSortData[];
}

type NonStoredKeys = keyof Pick<IteratorData, 'cache'>;

interface FetchPageResult {
  sortData: DocumentSortData[];
  hasMore: boolean;
}

const PAGE_SIZE = 100;
const MAX_CACHE_SIZE = 1000;
const MAX_PAGES_PER_FETCH = Math.ceil(MAX_CACHE_SIZE / PAGE_SIZE);

function reverseSort(sort: string): string {
  return sort.replace(/ (asc|desc)(,|$)/g, (match, c1) =>
    match.replace(c1, c1 === 'asc' ? 'desc' : 'asc'),
  );
}

@Injectable({
  providedIn: 'root',
})
export class SearchResultIteratorService {
  private storage = inject(LocalStorageService);
  private apiClient = inject(ApiClient);
  private userService = inject(UserService);

  private userId = computed(() => this.userService.user()?.id);

  private iteratorDataByType: Partial<{
    [T in KotkaDocumentType]: IteratorData | null;
  }> = {};

  setSearchParams(
    type: KotkaDocumentType,
    searchParams?: IteratorSearchParams,
  ) {
    const data =
      searchParams && searchParams.sort.length > 0
        ? { searchParams, cache: [] }
        : null;
    this.setIteratorData(type, this.userId(), data);
  }

  setCurrentData(type: KotkaDocumentType, data?: DocumentSortData) {
    const iteratorData = this.getIteratorData(type, this.userId());
    if (!iteratorData) {
      return;
    }
    this.setIteratorData(type, this.userId(), {
      ...iteratorData,
      currentData: data,
    });
  }

  getState(
    type: KotkaDocumentType,
    documentURI: string,
    id: string,
  ): Observable<IteratorState> {
    return this.updateCurrentData(type, documentURI, id).pipe(
      switchMap(() => forkJoin([this.getNext(type, true), this.getNext(type)])),
      map(([previous, next]) => ({ previous, next })),
    );
  }

  private updateCurrentData(
    type: KotkaDocumentType,
    documentURI: string,
    id: string,
  ): Observable<void> {
    const iteratorData = this.getIteratorData(type, this.userId());
    if (!iteratorData) {
      return of(undefined);
    }

    if (
      !iteratorData?.currentData ||
      iteratorData.currentData.id !== id ||
      iteratorData.currentData.documentURI !== documentURI
    ) {
      const currentData = iteratorData.cache.find(
        (data) => data.id === id && data.documentURI === documentURI,
      );
      if (currentData) {
        this.setIteratorData(type, this.userId(), {
          ...iteratorData,
          currentData,
        });

        return of(undefined);
      }

      return this.fetchPage(type, {
        ...iteratorData.searchParams,
        searchQuery: `id:"${id}" AND documentURI:"${documentURI}"`,
      }).pipe(
        map((result) => {
          this.setIteratorData(type, this.userId(), {
            ...iteratorData,
            currentData: result.sortData[0],
          });

          return undefined;
        }),
      );
    }

    return of(undefined);
  }

  private getNext(
    type: KotkaDocumentType,
    reverse = false,
  ): Observable<DocumentSortData | undefined> {
    const iteratorData = this.getIteratorData(type, this.userId());
    if (!iteratorData) {
      return of(undefined);
    }

    const { searchParams, currentData, cache } = iteratorData;

    if (!currentData) {
      return of(undefined);
    }

    const cached = this.getNextDocumentInCache(cache, currentData, reverse);
    if (cached) {
      return of(cached);
    }

    return this.fetchSortData(type, searchParams, currentData, reverse).pipe(
      map((sortData) => {
        const iteratorData = this.getIteratorData(type, this.userId());
        if (
          iteratorData?.searchParams !== searchParams ||
          iteratorData?.currentData !== currentData
        ) {
          return undefined;
        }

        const updatedCache = this.addDataToCache(
          iteratorData.cache,
          currentData,
          sortData,
          reverse,
        );

        this.setIteratorData(type, this.userId(), {
          ...iteratorData,
          cache: updatedCache,
        });

        return this.getNextDocumentInCache(updatedCache, currentData, reverse);
      }),
    );
  }

  private getNextDocumentInCache(
    cache: DocumentSortData[],
    currentData: DocumentSortData,
    reverse = false,
  ): DocumentSortData | undefined {
    const idx = cache.findIndex((data) => data.id === currentData.id);
    if (idx === -1) {
      return undefined;
    }

    if (!reverse) {
      for (let i = idx + 1; i < cache.length; i++) {
        if (cache[i].documentURI !== currentData.documentURI) {
          return cache[i];
        }
      }
    } else {
      for (let i = idx - 1; i >= 0; i--) {
        if (cache[i].documentURI !== currentData.documentURI) {
          return cache[i];
        }
      }
    }

    return undefined;
  }

  private addDataToCache(
    cache: DocumentSortData[],
    currentData: DocumentSortData,
    newData: DocumentSortData[],
    reverse: boolean,
  ): DocumentSortData[] {
    let idx = cache.findIndex((data) => data.id === currentData.id);

    if (idx === -1) {
      cache = [currentData];
      idx = 0;
    }

    cache = reverse ? cache.slice(idx) : cache.slice(0, idx + 1);

    cache = reverse ? [...newData.reverse(), ...cache] : [...cache, ...newData];

    if (cache.length > MAX_CACHE_SIZE) {
      cache = reverse
        ? cache.slice(0, MAX_CACHE_SIZE)
        : cache.slice(cache.length - MAX_CACHE_SIZE);
    }

    return cache;
  }

  private fetchSortData(
    type: KotkaDocumentType,
    searchParams: IteratorSearchParams,
    currentData: DocumentSortData,
    reverse: boolean,
  ): Observable<DocumentSortData[]> {
    let pageCount = 0;
    return this.fetchPage(type, searchParams, currentData.sort, reverse).pipe(
      expand((page) => {
        pageCount++;
        const hasNewData = page.sortData.some(
          (doc) => doc.documentURI !== currentData.documentURI,
        );
        return !hasNewData &&
          page.hasMore &&
          page.sortData.length > 0 &&
          pageCount < MAX_PAGES_PER_FETCH
          ? this.fetchPage(
              type,
              searchParams,
              page.sortData[page.sortData.length - 1].sort,
              reverse,
            )
          : EMPTY;
      }),
      reduce<FetchPageResult, DocumentSortData[]>(
        (all, page) => [...all, ...page.sortData],
        [],
      ),
    );
  }

  private fetchPage(
    type: KotkaDocumentType,
    searchParams: IteratorSearchParams,
    searchAfter?: any[],
    reverse?: boolean,
  ): Observable<FetchPageResult> {
    if (type !== KotkaDocumentType.specimen) {
      return of({ sortData: [], hasMore: false });
    }

    let searchQuery =
      typeof searchParams.searchQuery === 'string'
        ? queryStringToObject(searchParams.searchQuery)
        : searchParams.searchQuery;

    searchQuery = {
      ...(searchQuery || {}),
      search_after: searchAfter,
    };

    const sort = reverse ? reverseSort(searchParams.sort) : searchParams.sort;

    return this.apiClient
      .searchDocuments(
        type,
        searchParams.index,
        searchQuery,
        1,
        PAGE_SIZE,
        sort,
        ['id', 'documentURI'],
        undefined,
      )
      .pipe(
        map((result) => {
          const sortData: DocumentSortData[] = [];
          for (const member of result.member) {
            if (member._sort) {
              sortData.push({
                id: member.id,
                documentURI: member.documentURI,
                sort: member._sort,
              });
            }
          }
          return {
            sortData,
            hasMore: result.member.length === PAGE_SIZE,
          };
        }),
      );
  }

  private getIteratorData(
    type: KotkaDocumentType,
    userId: string | undefined,
  ): IteratorData | null {
    const result =
      this.iteratorDataByType[type] ||
      this.getIteratorDataFromStorage(type, userId);
    this.iteratorDataByType[type] = result;
    return result;
  }

  private setIteratorData(
    type: KotkaDocumentType,
    userId: string | undefined,
    data: IteratorData | null,
  ) {
    this.iteratorDataByType[type] = data;
    this.storeIteratorData(type, userId, data);
  }

  private getIteratorDataFromStorage(
    type: KotkaDocumentType,
    userId: string | undefined,
  ): IteratorData | null {
    const result: Omit<IteratorData, NonStoredKeys> | null =
      this.storage.retrieve(this.getIteratorDataStorageKey(type, userId)) ||
      null;
    return result ? { ...result, cache: [] } : null;
  }

  private storeIteratorData(
    type: KotkaDocumentType,
    userId: string | undefined,
    data: IteratorData | null,
  ) {
    const omittedKeys: TupleUnion<NonStoredKeys> = ['cache'];
    const dataToStore = data ? omit(data, omittedKeys) : null;
    this.storage.store(
      this.getIteratorDataStorageKey(type, userId),
      dataToStore,
    );
  }

  private getIteratorDataStorageKey(
    type: KotkaDocumentType,
    userId: string | undefined,
  ): string {
    if (!userId) {
      throw new Error('Missing user id!');
    }
    return `${type}-search-iterator-${userId}`;
  }
}
