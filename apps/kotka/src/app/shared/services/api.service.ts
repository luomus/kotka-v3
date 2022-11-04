import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dataset, ListResponse } from '@kotka/shared/models';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export enum DataType {
  dataset = 'dataset'
}

export type DataObject = Dataset;

const path = '/api/';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  constructor(
    private httpClient: HttpClient
  ) {}

  getAllDatasets(): Observable<Dataset[]> {
    return this.getAll(DataType.dataset);
  }

  getById(type: DataType.dataset, id: string): Observable<Dataset>;
  getById(type: DataType, id: string): Observable<DataObject> {
    return this.httpClient.get<DataObject>(path + type + '/' + id);
  }

  create(type: DataType.dataset, data: Dataset): Observable<Dataset>;
  create(type: DataType, data: Dataset): Observable<DataObject> {
    return this.httpClient.post<DataObject>(path + type, data);
  }

  update(type: DataType.dataset, id: string, data: Dataset): Observable<Dataset>;
  update(type: DataType, id: string, data: Dataset): Observable<DataObject> {
    return this.httpClient.put<DataObject>(path + type + '/' + id, data);
  }

  private getAll(type: DataType.dataset, page?: number, results?: Dataset[]): Observable<Dataset[]>;
  private getAll(type: DataType, page=1, results: DataObject[]=[]): Observable<DataObject[]> {
    const params = new HttpParams().set('page', page);
    return this.httpClient.get<ListResponse<Dataset>>(path + type, {params}).pipe(
      switchMap(result => {
        results = results.concat(result.member);
        if (result.currentPage < result.lastPage) {
          return this.getAll(type, page + 1, results);
        }
        return of(results);
      })
    );
  }
}
