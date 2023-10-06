import { Injectable } from '@angular/core';
import { ListResponse } from '@kotka/shared/models';
import { Observable } from 'rxjs';
import { KotkaDocumentType, DocumentObject, StorePatch, StoreVersion, KotkaVersionDifference } from '@kotka/api-interfaces';
import { map } from 'rxjs/operators';
import { set } from 'lodash';
import { ApiClient } from './api-services/api-client';

export interface DifferenceObject {
  [key: string]: DifferenceObject|Omit<StorePatch, 'path'>;
}

export interface VersionDifference<T extends KotkaDocumentType> {
  original: DocumentObject<T>;
  diff: DifferenceObject;
}

@Injectable({
  providedIn: 'root'
})

export class DataService {
  constructor(
    private apiClient: ApiClient
  ) {}

  getById<T extends KotkaDocumentType>(type: T, id: string): Observable<DocumentObject<T>> {
    return this.apiClient.getDocumentById(type, id);
  }

  create<T extends KotkaDocumentType>(type: T, data: DocumentObject<T>): Observable<DocumentObject<T>> {
    return this.apiClient.createDocument(type, data);
  }

  update<T extends KotkaDocumentType>(type: T, id: string, data: DocumentObject<T>): Observable<DocumentObject<T>> {
    return this.apiClient.updateDocument(type, id, data);
  }

  delete(type: KotkaDocumentType, id: string): Observable<null> {
    return this.apiClient.deleteDocument(type, id);
  }

  getData<T extends KotkaDocumentType>(type: T, page=1, pageSize=100, sort?: string, searchQuery?: string): Observable<ListResponse<DocumentObject<T>>> {
    return this.apiClient.getDocumentList(type, page, pageSize, sort, searchQuery);
  }

  getVersionList(type: KotkaDocumentType, id: string): Observable<StoreVersion[]> {
    return this.apiClient.getDocumentVersionList(type, id);
  }

  getVersionData<T extends KotkaDocumentType>(type: T, id: string, version: number): Observable<DocumentObject<T>> {
    return this.apiClient.getDocumentVersionData(type, id, version);
  }

  getVersionDifference<T extends KotkaDocumentType>(type: T, id: string, version1: number, version2: number): Observable<VersionDifference<T>> {
    return this.apiClient.getDocumentVersionDifference(type, id, version1, version2).pipe(
      map(data => this.convertVersionHistoryFormat<T>(data))
    );
  }

  private convertVersionHistoryFormat<T extends KotkaDocumentType>(data: KotkaVersionDifference): VersionDifference<T> {
    const diff = {};

    data.patch.forEach(patch => {
      const path = patch.path.split('/').filter(value => !!value);
      set(diff, path, { op: patch.op, value: patch.value });
    });

    return {
      original: data.original as DocumentObject<T>,
      diff
    };
  }
}
