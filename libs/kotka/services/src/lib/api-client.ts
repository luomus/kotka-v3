import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Area,
  KotkaDocumentObject,
  KotkaDocumentObjectType,
  KotkaVersionDifference,
  LajiForm,
  ListResponse,
  PagedResult,
  Person,
  StoreVersion
} from '@kotka/shared/models';
import { Observable, of, switchMap } from 'rxjs';
import { apiBase, lajiApiBase } from './constants';
import {
  RangeResponse,
  LoginResponse,
  AutocompleteResult
} from '@kotka/api-interfaces';
import { Organization, Collection } from '@luomus/laji-schema';
import { map } from 'rxjs/operators';

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

  getDocumentById<T extends KotkaDocumentObject>(type: KotkaDocumentObjectType, id: string): Observable<T> {
    return this.httpClient.get<T>(path + type + '/' + id);
  }

  createDocument<T extends KotkaDocumentObject>(type: KotkaDocumentObjectType, data: KotkaDocumentObject): Observable<T> {
    return this.httpClient.post<T>(path + type, data);
  }

  updateDocument<T extends KotkaDocumentObject>(type: KotkaDocumentObjectType, id: string, data: KotkaDocumentObject): Observable<T> {
    return this.httpClient.put<T>(path + type + '/' + id, data);
  }

  deleteDocument(type: KotkaDocumentObjectType, id: string): Observable<null> {
    return this.httpClient.delete<null>(path + type + '/' + id);
  }

  getDocumentList<T extends KotkaDocumentObject>(type: KotkaDocumentObjectType, page=1, pageSize=100, sort?: string, searchQuery?: string): Observable<ListResponse<T>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (sort) {
      params = params.set('sort', sort);
    }
    if (searchQuery) {
      params = params.set('q', searchQuery);
    }
    return this.httpClient.get<ListResponse<T>>(path + type, {params});
  }

  getDocumentsById<T extends KotkaDocumentObject>(type: KotkaDocumentObjectType, ids: string[], page=1, pageSize=1000, results: T[]=[]): Observable<T[]> {
    const searchQuery = ids.filter(id => !!id).map(id => `id:${id}`).join(' OR ');
    return this.getDocumentList<T>(type, page, pageSize, undefined, searchQuery).pipe(
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

  getDocumentVersionData(type: KotkaDocumentObjectType, id: string, version: number): Observable<KotkaDocumentObject> {
    return this.httpClient.get<KotkaDocumentObject>(path + type + '/' + id + '/_ver/' + version);
  }

  getDocumentVersionDifference(type: KotkaDocumentObjectType, id: string, version1: number, version2: number): Observable<KotkaVersionDifference> {
    return this.httpClient.get<KotkaVersionDifference>(path + type + '/' + id + '/_ver/' + version1 + '/diff/' + version2);
  }

  getForm(formId: string): Observable<LajiForm.SchemaForm> {
    return this.httpClient.get<LajiForm.SchemaForm>(`${lajiApiPath}forms/${formId}`);
  }

  getFormInJsonFormat(formId: string): Observable<LajiForm.JsonForm> {
    const params = new HttpParams().set('format', 'json');
    return this.httpClient.get<LajiForm.JsonForm>(`${lajiApiPath}forms/${formId}`, { params });
  }

  getSpecimenRange(range: string): Observable<RangeResponse> {
    return this.httpClient.get<RangeResponse>(`${path}specimen/range/${range}`);
  }

  getOrganization(id: string): Observable<Organization> {
    return this.httpClient.get<Organization>(`${path}organization/old/${id}`);
  }

  getOrganizations(ids: string[]): Observable<Organization[]> {
    const params = new HttpParams().set('ids', ids.join(','));
    return this.httpClient.get<ListResponse<Organization>>(`${path}organization/old`, { params }).pipe(
      map(result => result.member)
    );
  }

  getOrganizationAutocomplete(query = ''): Observable<AutocompleteResult[]> {
    const params = new HttpParams().set('q', query);
    return this.httpClient.get<AutocompleteResult[]>(`${path}organization/old/autocomplete`, { params });
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

  login(): Observable<LoginResponse> {
    return this.httpClient.get<LoginResponse>(authPath + 'postLogin');
  }

  logout(): Observable<void> {
    return this.httpClient.get<void>(authPath + 'logout');
  }

  htmlToPdf(html: string): Observable<Blob> {
    return this.httpClient.post(`${lajiApiPath}html-to-pdf`, html, { responseType: 'blob' });
  }
}
