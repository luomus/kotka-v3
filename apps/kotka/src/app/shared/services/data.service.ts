import { Injectable } from '@angular/core';
import {
  KotkaDocumentObjectType,
  KotkaDocumentObject,
  KotkaVersionDifferenceObject,
  ListResponse,
  StoreVersion,
  KotkaVersionDifference
} from '@kotka/shared/models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { set } from 'lodash';
import { ApiClient } from './api-services/api-client';


@Injectable({
  providedIn: 'root'
})

export class DataService {
  constructor(
    private apiClient: ApiClient
  ) {}

  getById(type: KotkaDocumentObjectType, id: string): Observable<KotkaDocumentObject> {
    return this.apiClient.getDocumentById(type, id);
  }

  create(type: KotkaDocumentObjectType, data: KotkaDocumentObject): Observable<KotkaDocumentObject> {
    return this.apiClient.createDocument(type, data);
  }

  update(type: KotkaDocumentObjectType, id: string, data: KotkaDocumentObject): Observable<KotkaDocumentObject> {
    return this.apiClient.updateDocument(type, id, data);
  }

  delete(type: KotkaDocumentObjectType, id: string): Observable<null> {
    return this.apiClient.deleteDocument(type, id);
  }

  getData(type: KotkaDocumentObjectType, page=1, pageSize=100, sort?: string, searchQuery?: string): Observable<ListResponse<KotkaDocumentObject>> {
    return this.apiClient.getDocumentList(type, page, pageSize, sort, searchQuery);
  }

  getVersionList(type: KotkaDocumentObjectType, id: string): Observable<StoreVersion[]> {
    return this.apiClient.getDocumentVersionList(type, id);
  }

  getVersionData(type: KotkaDocumentObjectType, id: string, version: number): Observable<KotkaDocumentObject> {
    return this.apiClient.getDocumentVersionData(type, id, version);
  }

  getVersionDifference(type: KotkaDocumentObjectType, id: string, version1: number, version2: number): Observable<KotkaVersionDifferenceObject> {
    return this.apiClient.getDocumentVersionDifference(type, id, version1, version2).pipe(
      map(data => this.convertVersionHistoryFormat(data))
    );
  }

  private convertVersionHistoryFormat(data: KotkaVersionDifference): KotkaVersionDifferenceObject {
    const diff = {};

    data.patch.forEach(patch => {
      const path = patch.path.split('/').filter(value => !!value);
      set(diff, path, { op: patch.op, value: patch.value });
    });

    return {
      original: data.original,
      diff
    };
  }
}
