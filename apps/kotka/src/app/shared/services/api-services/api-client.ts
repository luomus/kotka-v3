import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Area,
  LajiForm,
  LajiOrganization,
  ListResponse,
  PagedResult,
  Person
} from '@kotka/shared/models';
import { Observable } from 'rxjs';
import { apiBase, lajiApiBase } from './constants';
import {
  KotkaDocumentType,
  StoreVersion,
  KotkaVersionDifference,
  RangeResponse,
  DocumentObject, LoginResponse
} from '@kotka/api-interfaces';

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

  getDocumentById<T extends KotkaDocumentType>(type: T, id: string): Observable<DocumentObject<T>> {
    return this.httpClient.get<DocumentObject<T>>(path + type + '/' + id);
  }

  createDocument<T extends KotkaDocumentType>(type: T, data: DocumentObject<T>): Observable<DocumentObject<T>> {
    return this.httpClient.post<DocumentObject<T>>(path + type, data);
  }

  updateDocument<T extends KotkaDocumentType>(type: T, id: string, data: DocumentObject<T>): Observable<DocumentObject<T>> {
    return this.httpClient.put<DocumentObject<T>>(path + type + '/' + id, data);
  }

  deleteDocument(type: KotkaDocumentType, id: string): Observable<null> {
    return this.httpClient.delete<null>(path + type + '/' + id);
  }

  getDocumentList<T extends KotkaDocumentType>(type: T, page=1, pageSize=100, sort?: string, searchQuery?: string): Observable<ListResponse<DocumentObject<T>>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (sort) {
      params = params.set('sort', sort);
    }
    if (searchQuery) {
      params = params.set('q', searchQuery);
    }
    return this.httpClient.get<ListResponse<DocumentObject<T>>>(path + type, {params});
  }

  getDocumentVersionList(type: KotkaDocumentType, id: string): Observable<StoreVersion[]> {
    return this.httpClient.get<StoreVersion[]>(path + type + '/' + id + '/_ver');
  }

  getDocumentVersionData<T extends KotkaDocumentType>(type: T, id: string, version: number): Observable<DocumentObject<T>> {
    return this.httpClient.get<DocumentObject<T>>(path + type + '/' + id + '/_ver/' + version);
  }

  getDocumentVersionDifference(type: KotkaDocumentType, id: string, version1: number, version2: number): Observable<KotkaVersionDifference> {
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

  getOrganization(id: string): Observable<LajiOrganization> {
    return this.httpClient.get<LajiOrganization>(`${lajiApiPath}organization/by-id/${id}`);
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

  logout(): Observable<any> {
    return this.httpClient.get(authPath + 'logout');
  }
}
