import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Area,
  KotkaDocumentObject,
  KotkaDocumentObjectType,
  KotkaDocumentObjectMap,
  KotkaVersionDifference,
  KotkaVersionDifferenceObject,
  LajiForm,
  ListResponse,
  PagedResult,
  Person,
  StorePatch,
  StoreVersion
} from '@kotka/shared/models';
import { Observable, of, switchMap } from 'rxjs';
import { apiBase, lajiApiBase } from './constants';
import {
  RangeResult,
  LoginResult,
  AutocompleteResult
} from '@kotka/shared/models';
import { Collection } from '@luomus/laji-schema';
import { map } from 'rxjs/operators';
import { get, set } from 'lodash';

const path = apiBase + '/';
const authPath = apiBase + '/auth/';
const lajiApiPath = lajiApiBase + '/';

@Injectable({
  providedIn: 'root'
})

export class ApiClient {
  constructor(
    private httpClient: HttpClient
  ) {}

  getDocumentById<T extends KotkaDocumentObjectType, S extends KotkaDocumentObjectMap[T]>(type: T, id: string): Observable<S> {
    return this.httpClient.get<S>(path + type + '/' + id);
  }

  createDocument<T extends KotkaDocumentObjectType, S extends KotkaDocumentObjectMap[T]>(type: T, data: S): Observable<S> {
    return this.httpClient.post<S>(path + type, data);
  }

  updateDocument<T extends KotkaDocumentObjectType, S extends KotkaDocumentObjectMap[T]>(type: T, id: string, data: S): Observable<S> {
    return this.httpClient.put<S>(path + type + '/' + id, data);
  }

  deleteDocument(type: KotkaDocumentObjectType, id: string): Observable<null> {
    return this.httpClient.delete<null>(path + type + '/' + id);
  }

  getDocumentList<T extends KotkaDocumentObjectType, S extends KotkaDocumentObjectMap[T]>(
    type: T, page=1, pageSize=100, sort?: string, searchQuery?: string
  ): Observable<ListResponse<S>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (sort) {
      params = params.set('sort', sort);
    }
    if (searchQuery) {
      params = params.set('q', searchQuery);
    }
    return this.httpClient.get<ListResponse<S>>(path + type, {params});
  }

  getDocumentsById<T extends KotkaDocumentObjectType, S extends KotkaDocumentObjectMap[T]>(
    type: T, ids: string[], page=1, pageSize=1000, results: S[]=[]
  ): Observable<S[]> {
    const searchQuery = ids.filter(id => !!id).map(id => `id:${id}`).join(' OR ');
    return this.getDocumentList<T, S>(type, page, pageSize, undefined, searchQuery).pipe(
      switchMap(result => {
        results = results.concat(result.member);
        if (result.currentPage < result.lastPage) {
          return this.getDocumentsById(type, ids, page + 1, pageSize, results);
        }
        return of(results);
      })
    );
  }

  getDocumentVersionList(type: KotkaDocumentObjectType, id: string): Observable<StoreVersion[]> {
    return this.httpClient.get<StoreVersion[]>(path + type + '/' + id + '/_ver');
  }

  getDocumentVersionData<T extends KotkaDocumentObjectType, S extends KotkaDocumentObjectMap[T]>(
    type: T, id: string, version: number
  ): Observable<S> {
    return this.httpClient.get<S>(path + type + '/' + id + '/_ver/' + version);
  }

  getDocumentVersionDifference<T extends KotkaDocumentObjectType, S extends KotkaDocumentObjectMap[T]>(
    type: T, id: string, version1: number, version2: number
  ): Observable<KotkaVersionDifferenceObject<S>> {
    return this.httpClient.get<KotkaVersionDifference<S>>(path + type + '/' + id + '/_ver/' + version1 + '/diff/' + version2).pipe(
      map(data => this.convertVersionDifferenceFormat(data))
    );
  }

  getAutocomplete(type: KotkaDocumentObjectType.dataset|KotkaDocumentObjectType.organization, query = ''): Observable<AutocompleteResult[]> {
    const params = new HttpParams().set('q', query);
    return this.httpClient.get<AutocompleteResult[]>(`${path}${type}/autocomplete`, { params });
  }

  getForm(formId: string): Observable<LajiForm.SchemaForm> {
    return this.httpClient.get<LajiForm.SchemaForm>(`${lajiApiPath}forms/${formId}`);
  }

  getFormInJsonFormat(formId: string): Observable<LajiForm.JsonForm> {
    const params = new HttpParams().set('format', 'json');
    return this.httpClient.get<LajiForm.JsonForm>(`${lajiApiPath}forms/${formId}`, { params });
  }

  getSpecimenRange(range: string): Observable<RangeResult> {
    return this.httpClient.get<RangeResult>(`${path}specimen/range/${range}`);
  }

  getCollection(id: string): Observable<Collection> {
    return this.httpClient.get<Collection>(`${path}collection/${id}`);
  }

  getCollections(ids: string[]): Observable<Collection[]> {
    const params = new HttpParams().set('ids', ids.join(','));
    return this.httpClient.get<ListResponse<Collection>>(`${path}collection`, { params }).pipe(
      map(result => result.member)
    );
  }

  getCollectionAutocomplete(query = ''): Observable<AutocompleteResult[]> {
    const params = new HttpParams().set('q', query);
    return this.httpClient.get<AutocompleteResult[]>(`${path}collection/autocomplete`, { params });
  }

  getPerson(id: string): Observable<Person> {
    return this.httpClient.get<Person>(`${lajiApiPath}person/by-id/${id}`);
  }

  getCountryList(page = 1, pageSize = 1000): Observable<PagedResult<Area>> {
    const params = new HttpParams().set('type', 'country').set('page', page).set('pageSize', pageSize).set('lang', 'en');
    return this.httpClient.get<PagedResult<Area>>(`${lajiApiPath}areas`, { params });
  }

  getSessionProfile(): Observable<Person | null> {
    return this.httpClient.get<Person>(authPath + 'user');
  }

  login(): Observable<LoginResult> {
    return this.httpClient.get<LoginResult>(authPath + 'postLogin');
  }

  logout(): Observable<void> {
    return this.httpClient.get<void>(authPath + 'logout');
  }

  htmlToPdf(html: string): Observable<Blob> {
    return this.httpClient.post(`${lajiApiPath}html-to-pdf`, html, { responseType: 'blob' });
  }

  private convertVersionDifferenceFormat<S extends KotkaDocumentObject>(data: KotkaVersionDifference<S>): KotkaVersionDifferenceObject<S> {
    const diff = {};
    const isRemovedFromArray: Record<string, boolean[]> = {};

    const getIdxBeforeArrayRemovals = (idx: number, arrayPath: string[], patch: StorePatch): number => {
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

      if (patch.op === "remove") {
        isRemoved[idx] = true;
      }

      return idx;
    };

    const parsePatchPath = (patch: StorePatch): string[] => {
      const path = patch.path.split('/').filter(value => !!value);

      const parentPath = path.slice(0, -1);
      const parentValue = get(data.original, parentPath);

      let lastPathPart = path[path.length - 1];

      if (lastPathPart === '-') {
        const originalArray = parentValue || [];
        const diffArray = get(diff, parentPath) || [];
        lastPathPart = Math.max(originalArray.length, diffArray.length).toString();
      } else if (Array.isArray(parentValue)) {
        let arrayIdx = parseInt(lastPathPart, 10);
        arrayIdx = getIdxBeforeArrayRemovals(arrayIdx, parentPath, patch);
        lastPathPart = arrayIdx.toString();
      }

      path[path.length - 1] = lastPathPart;

      return path;
    };


    data.patch.forEach(patch => {
      const path = parsePatchPath(patch);
      set(diff, path, { op: patch.op, value: patch.value });
    });

    return {
      original: data.original,
      diff
    };
  }
}
