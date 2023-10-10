import { Injectable } from '@angular/core';
import { ListResponse } from '@kotka/shared/models';
import { Observable } from 'rxjs';
import { KotkaObjectType, KotkaObject, StorePatch, StoreVersion, KotkaVersionDifference } from '@kotka/api-interfaces';
import { map } from 'rxjs/operators';
import { set } from 'lodash';
import { ApiClient } from './api-services/api-client';

export interface DifferenceObject {
  [key: string]: DifferenceObject|Omit<StorePatch, 'path'>;
}

export interface VersionDifference<T extends KotkaObjectType> {
  original: KotkaObject<T>;
  diff: DifferenceObject;
}

@Injectable({
  providedIn: 'root'
})

export class DataService {
  constructor(
    private apiClient: ApiClient
  ) {}

  getById<T extends KotkaObjectType>(type: T, id: string): Observable<KotkaObject<T>> {
    return this.apiClient.getDocumentById(type, id);
  }

  create<T extends KotkaObjectType>(type: T, data: KotkaObject<T>): Observable<KotkaObject<T>> {
    return this.apiClient.createDocument(type, data);
  }

  update<T extends KotkaObjectType>(type: T, id: string, data: KotkaObject<T>): Observable<KotkaObject<T>> {
    return this.apiClient.updateDocument(type, id, data);
  }

  delete(type: KotkaObjectType, id: string): Observable<null> {
    return this.apiClient.deleteDocument(type, id);
  }

  getData<T extends KotkaObjectType>(type: T, page=1, pageSize=100, sort?: string, searchQuery?: string): Observable<ListResponse<KotkaObject<T>>> {
    return this.apiClient.getDocumentList(type, page, pageSize, sort, searchQuery);
  }

  getVersionList(type: KotkaObjectType, id: string): Observable<StoreVersion[]> {
    return this.apiClient.getDocumentVersionList(type, id);
  }

  getVersionData<T extends KotkaObjectType>(type: T, id: string, version: number): Observable<KotkaObject<T>> {
    return this.apiClient.getDocumentVersionData(type, id, version);
  }

  getVersionDifference<T extends KotkaObjectType>(type: T, id: string, version1: number, version2: number): Observable<VersionDifference<T>> {
    return this.apiClient.getDocumentVersionDifference(type, id, version1, version2).pipe(
      map(data => this.convertVersionHistoryFormat<T>(data))
    );
  }

  private convertVersionHistoryFormat<T extends KotkaObjectType>(data: KotkaVersionDifference): VersionDifference<T> {
    const diff = {};

    data.patch.forEach(patch => {
      const path = patch.path.split('/').filter(value => !!value);
      set(diff, path, { op: patch.op, value: patch.value });
    });

    return {
      original: data.original as KotkaObject<T>,
      diff
    };
  }
}
