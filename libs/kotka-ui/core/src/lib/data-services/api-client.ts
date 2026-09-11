import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Area,
  KotkaDocument,
  KotkaDocumentType,
  KotkaVersionDifference,
  KotkaVersionDifferenceObject,
  LajiForm,
  ListResponse,
  PagedResult,
  Person,
  StorePatch,
  StoreVersion,
  MediaType,
  Media, IndexType, SearchResult, SearchField
} from '@kotka/shared/models';
import { Observable, of, switchMap, forkJoin } from 'rxjs';
import { apiBase, lajiApiBase} from './constants';
import {
  RangeResult,
  LoginResult,
  AutocompleteResult,
} from '@kotka/shared/models';
import { Collection } from '@luomus/laji-schema';
import { map } from 'rxjs/operators';
import { get, set } from 'lodash';
import { LOGIN_REDIRECT_ENABLED } from '../interceptors';
import { ElasticsearchQuery } from '@kotka/shared/models';

const path = apiBase + '/';
const authPath = apiBase + '/auth/';
const lajiApiPath = lajiApiBase + '/';

export interface DocumentListSearchParams<
  T extends KotkaDocumentType = KotkaDocumentType,
> {
  type: T;
  searchQuery?: string | ElasticsearchQuery;
  page?: number;
  pageSize?: number;
  sort?: string;
  fields?: string[];
}

export const searchQueryStringToObject = (searchQuery: string): ElasticsearchQuery => {
  return {
    query: {
      query_string: {
        query: searchQuery,
      },
    }
  };
};

@Injectable({
  providedIn: 'root',
})
export class ApiClient {
  private httpClient = inject(HttpClient);

  getDocumentById<T extends KotkaDocumentType>(
    type: T,
    id: string,
  ): Observable<KotkaDocument<T>> {
    return this.httpClient.get<KotkaDocument<T>>(path + type + '/' + id);
  }

  createDocument<T extends KotkaDocumentType>(
    type: T,
    data: KotkaDocument<T>,
  ): Observable<KotkaDocument<T>> {
    return this.httpClient.post<KotkaDocument<T>>(path + type, data);
  }

  updateDocument<T extends KotkaDocumentType>(
    type: T,
    id: string,
    data: KotkaDocument<T>,
  ): Observable<KotkaDocument<T>> {
    return this.httpClient.put<KotkaDocument<T>>(path + type + '/' + id, data);
  }

  deleteDocument(type: KotkaDocumentType, id: string): Observable<null> {
    return this.httpClient.delete<null>(path + type + '/' + id);
  }

  getDocumentList<
    T extends KotkaDocumentType,
    X extends string[] | undefined = undefined,
    Y extends X extends string[]
      ? Partial<KotkaDocument<T>>
      : KotkaDocument<T> = KotkaDocument<T>,
  >(
    type: T,
    searchQuery?: string | ElasticsearchQuery,
    page = 1,
    pageSize = 100,
    sort?: string,
    fields?: X,
  ): Observable<ListResponse<Y>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (sort) {
      params = params.set('sort', sort);
    }
    if (fields) {
      params = params.set('fields', fields.join(','));
    }

    if (searchQuery && typeof searchQuery === 'string') {
      if (searchQuery.length > 500) {
        searchQuery = searchQueryStringToObject(searchQuery);
      } else {
        params = params.set('q', searchQuery);
      }
    }

    if (searchQuery && typeof searchQuery !== 'string') {
      return this.httpClient.post<ListResponse<Y>>(
        path + type + '/_search',
        searchQuery,
        { params },
      );
    } else {
      return this.httpClient.get<ListResponse<Y>>(path + type, { params });
    }
  }

  getDocumentsById<
    T extends KotkaDocumentType,
    X extends string[] | undefined = undefined,
    Y extends X extends string[]
      ? Partial<KotkaDocument<T>>
      : KotkaDocument<T> = KotkaDocument<T>,
  >(
    type: T,
    ids: string[],
    fields?: X,
    page = 1,
    pageSize = 1000,
    results: Y[] = [],
  ): Observable<Y[]> {
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const idsPart = ids.slice(startIdx, endIdx);

    const searchQuery: ElasticsearchQuery = {
      query: {
        terms: {
          id: idsPart,
        },
      },
    };

    return this.getDocumentList<T, X, Y>(
      type,
      searchQuery,
      1,
      idsPart.length,
      undefined,
      fields,
    ).pipe(
      switchMap((result) => {
        results = results.concat(result.member);
        if (endIdx < ids.length) {
          return this.getDocumentsById(
            type,
            ids,
            fields,
            page + 1,
            pageSize,
            results,
          );
        }
        return of(results);
      }),
    );
  }

  getAllDocuments<
    T extends KotkaDocumentType,
    X extends string[] | undefined = undefined,
    Y extends X extends string[]
      ? Partial<KotkaDocument<T>>
      : KotkaDocument<T> = KotkaDocument<T>,
  >(
    type: T,
    searchQuery?: string | ElasticsearchQuery,
    pageSize = 100,
    sort?: string,
    fields?: X
  ): Observable<Y[]> {
    return this.getAllDocumentsRecursively(
      type,
      searchQuery,
      1,
      pageSize,
      sort,
      fields
    );
  }

  searchDocuments<
    T extends IndexType,
    X extends string[] | undefined = undefined,
    Y extends X extends string[]
      ? Partial<SearchResult<T>>
      : SearchResult<T> = SearchResult<T>,
  >(
    type: KotkaDocumentType.specimen,
    index: T,
    searchQuery?: string | ElasticsearchQuery,
    page = 1,
    pageSize = 100,
    sort?: string,
    fields?: X,
  ): Observable<ListResponse<Y>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (sort) {
      params = params.set('sort', sort);
    }
    if (fields) {
      params = params.set('fields', fields.join(','));
    }

    if (typeof searchQuery === 'string') {
      searchQuery = searchQueryStringToObject(searchQuery);
    }

    return this.httpClient.post<ListResponse<Y>>(
      `${path}${type}/${index}/_search`,
      { ...searchQuery, _source: true },
      { params },
    );
  }

  getSearchFields(type: KotkaDocumentType.specimen, index: IndexType): Observable<SearchField[]> {
    return this.httpClient.get<SearchField[]>(`${path}${type}/${index}/fields`);
  }

  getSearchAutocomplete(type: KotkaDocumentType.specimen, field: string, query: string, limit?: number): Observable<string[]> {
    let params = new HttpParams().set('field', field).set('q', query);
    if (limit) {
      params = params.set('limit', limit);
    }

    return this.httpClient.get<string[]>(`${path}${type}/autocomplete`, { params });
  }

  getDocumentVersionList(
    type: KotkaDocumentType,
    id: string,
  ): Observable<StoreVersion[]> {
    return this.httpClient.get<StoreVersion[]>(
      path + type + '/' + id + '/_ver',
    );
  }

  getDocumentVersionData<T extends KotkaDocumentType>(
    type: T,
    id: string,
    version: number,
  ): Observable<KotkaDocument<T>> {
    return this.httpClient.get<KotkaDocument<T>>(
      path + type + '/' + id + '/_ver/' + version,
    );
  }

  getDocumentVersionDifference<T extends KotkaDocumentType>(
    type: T,
    id: string,
    version1: number,
    version2: number,
  ): Observable<KotkaVersionDifferenceObject<KotkaDocument<T>>> {
    return this.httpClient
      .get<
        KotkaVersionDifference<KotkaDocument<T>>
      >(path + type + '/' + id + '/_ver/' + version1 + '/diff/' + version2)
      .pipe(map((data) => this.convertVersionDifferenceFormat(data)));
  }

  getAutocomplete(
    type: KotkaDocumentType.dataset | KotkaDocumentType.organization,
    query = '',
  ): Observable<AutocompleteResult[]> {
    const params = new HttpParams().set('query', query);
    return this.httpClient.get<AutocompleteResult[]>(
      `${path}${type}/autocomplete`,
      { params },
    );
  }

  getForm(formId: string): Observable<LajiForm.SchemaForm> {
    return this.httpClient.get<LajiForm.SchemaForm>(
      `${lajiApiPath}forms/${formId}`,
    );
  }

  getFormInJsonFormat(formId: string): Observable<LajiForm.JsonForm> {
    const params = new HttpParams().set('format', 'json');
    return this.httpClient.get<LajiForm.JsonForm>(
      `${lajiApiPath}forms/${formId}`,
      { params },
    );
  }

  getSpecimenRange(range: string): Observable<RangeResult> {
    return this.httpClient.get<RangeResult>(`${path}specimen/range/${range}`);
  }

  getCollection(id: string): Observable<Collection> {
    return this.httpClient.get<Collection>(`${path}collection/${id}`);
  }

  getCollections(ids: string[]): Observable<Collection[]> {
    const params = new HttpParams().set('ids', ids.join(','));
    return this.httpClient
      .get<ListResponse<Collection>>(`${path}collection`, { params })
      .pipe(map((result) => result.member));
  }

  getCollectionAutocomplete(query = ''): Observable<AutocompleteResult[]> {
    const params = new HttpParams().set('query', query);
    return this.httpClient.get<AutocompleteResult[]>(
      `${path}collection/autocomplete`,
      { params },
    );
  }

  getPerson(id: string): Observable<Person> {
    return this.httpClient.get<Person>(`${lajiApiPath}person/by-id/${id}`);
  }

  getMedia<T extends MediaType>(type: T, id: string): Observable<Media<T>> {
    return this.httpClient.get<Media<T>>(`${path}media/${type}/${id}`);
  }

  getMediaByIds<T extends MediaType>(
    type: T,
    ids: string[],
  ): Observable<Media<T>[]> {
    if (!ids.length) return of([]);
    return forkJoin(ids.map((id) => this.getMedia<T>(type, id)));
  }

  getCountryList(page = 1, pageSize = 1000): Observable<PagedResult<Area>> {
    const params = new HttpParams()
      .set('areaType', 'ML.country')
      .set('page', page)
      .set('pageSize', pageSize);
    return this.httpClient.get<PagedResult<Area>>(`${lajiApiPath}areas`, {
      params,
    });
  }

  getSessionProfile(): Observable<Person | null> {
    return this.httpClient.get<Person>(authPath + 'user', {
      context: new HttpContext().set(LOGIN_REDIRECT_ENABLED, false),
    });
  }

  login(): Observable<LoginResult> {
    return this.httpClient.get<LoginResult>(authPath + 'postLogin');
  }

  logout(): Observable<void> {
    return this.httpClient.get<void>(authPath + 'logout');
  }

  htmlToPdf(html: string): Observable<Blob> {
    return this.httpClient.post(`${lajiApiPath}html-to-pdf`, html, {
      responseType: 'blob',
    });
  }

  searchTaxon(query: string, matchType?: string): Observable<PagedResult<any>> {
    let params = new HttpParams().set('query', query);
    if (matchType) {
      params = params.set('matchType', matchType);
    }
    return this.httpClient.get<PagedResult<any>>(
      `${lajiApiPath}autocomplete/taxa`,
      { params },
    );
  }

  private convertVersionDifferenceFormat<S extends KotkaDocument>(
    data: KotkaVersionDifference<S>,
  ): KotkaVersionDifferenceObject<S> {
    const diff = {};
    const isRemovedFromArray: Record<string, boolean[]> = {};

    const getIdxBeforeArrayRemovals = (
      idx: number,
      arrayPath: string[],
      patch: StorePatch,
    ): number => {
      const arrayPathString = arrayPath.join('/');

      if (!isRemovedFromArray[arrayPathString]) {
        isRemovedFromArray[arrayPathString] = [];
      }

      const isRemoved = isRemovedFromArray[arrayPathString];

      for (let i = 0; i < isRemoved.length && i <= idx; i++) {
        if (isRemoved[i]) {
          idx++;
        }
      }

      if (patch.op === 'remove') {
        isRemoved[idx] = true;
      }

      return idx;
    };

    const parsePatchPath = (patch: StorePatch): string[] => {
      const path = patch.path.split('/').filter((value) => !!value);

      const parentPath = path.slice(0, -1);
      const parentValue = get(data.original, parentPath);

      let lastPathPart = path[path.length - 1];

      if (lastPathPart === '-') {
        const originalArray = parentValue || [];
        const diffArray = get(diff, parentPath) || [];
        lastPathPart = Math.max(
          originalArray.length,
          diffArray.length,
        ).toString();
      } else if (Array.isArray(parentValue)) {
        let arrayIdx = parseInt(lastPathPart, 10);
        arrayIdx = getIdxBeforeArrayRemovals(arrayIdx, parentPath, patch);
        lastPathPart = arrayIdx.toString();
      }

      path[path.length - 1] = lastPathPart;

      return path;
    };

    data.patch.forEach((patch) => {
      const path = parsePatchPath(patch);
      set(diff, path, { op: patch.op, value: patch.value });
    });

    return {
      original: data.original,
      diff,
    };
  }

  private getAllDocumentsRecursively<
    T extends KotkaDocumentType,
    X extends string[] | undefined = undefined,
    Y extends X extends string[]
      ? Partial<KotkaDocument<T>>
      : KotkaDocument<T> = KotkaDocument<T>,
  >(
    type: T,
    searchQuery?: string | ElasticsearchQuery,
    page = 1,
    pageSize = 100,
    sort?: string,
    fields?: X,
    results: Y[] = [],
  ): Observable<Y[]> {
    return this.getDocumentList<T, X, Y>(
      type,
      searchQuery,
      page,
      pageSize,
      sort,
      fields,
    ).pipe(
      switchMap((result) => {
        results = results.concat(result.member);

        if (page < result.lastPage) {
          return this.getAllDocumentsRecursively(
            type,
            searchQuery,
            page + 1,
            pageSize,
            sort,
            fields,
            results,
          );
        }

        return of(results);
      }),
    );
  }
}
