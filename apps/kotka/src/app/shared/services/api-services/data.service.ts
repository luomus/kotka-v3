import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dataset, ListResponse, SpecimenTransaction } from '@kotka/shared/models';
import { Observable } from 'rxjs';
import { apiBase } from './constants';
import { StorePatch, StoreVersion, StoreVersionDifference } from '@kotka/api-interfaces';
import { map } from 'rxjs/operators';
import { set } from 'lodash';

export enum DataType {
  dataset = 'dataset',
  transaction = 'transaction'
}

export type DataObject = Dataset | SpecimenTransaction;

export interface DifferenceObject {
  [key: string]: DifferenceObject|Omit<StorePatch, 'path'>;
}

export interface VersionDifference {
  original: DataObject;
  diff: DifferenceObject;
}

const path = apiBase + '/';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  constructor(
    private httpClient: HttpClient
  ) {}

  getById(type: DataType, id: string): Observable<DataObject> {
    return this.httpClient.get<DataObject>(path + type + '/' + id);
  }

  create(type: DataType, data: DataObject): Observable<DataObject> {
    return this.httpClient.post<DataObject>(path + type, data);
  }

  update(type: DataType, id: string, data: DataObject): Observable<DataObject> {
    return this.httpClient.put<DataObject>(path + type + '/' + id, data);
  }

  delete(type: DataType, id: string): Observable<null> {
    return this.httpClient.delete<null>(path + type + '/' + id);
  }

  getData(type: DataType, page=1, pageSize=100, sort?: string, searchQuery?: string): Observable<ListResponse<DataObject>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (sort) {
      params = params.set('sort', sort);
    }
    if (searchQuery) {
      params = params.set('q', searchQuery);
    }
    return this.httpClient.get<ListResponse<DataObject>>(path + type, {params});
  }

  getVersionList(type: DataType, id: string): Observable<StoreVersion[]> {
    return this.httpClient.get<StoreVersion[]>(path + type + '/' + id + '/_ver');
  }

  getVersionData(type: DataType, id: string, version: string): Observable<DataObject> {
    return this.httpClient.get<DataObject>(path + type + '/' + id + '/_ver/' + version);
  }

  getVersionDifference(type: DataType, id: string, version1: string, version2: string): Observable<VersionDifference> {
    return this.httpClient.get<StoreVersionDifference>(path + type + '/' + id + '/_ver/' + version1 + '/diff/' + version2).pipe(
      map(data => this.convertVersionHistoryFormat(data))
    );
  }

  private convertVersionHistoryFormat(data: StoreVersionDifference): VersionDifference {
    const diff = {};

    data.patch.forEach(patch => {
      const path = patch.path.split('/').filter(value => !!value);
      set(diff, path, { op: patch.op, value: patch.value });
    });

    return {
      original: data.original as DataObject,
      diff
    };
  }
}
