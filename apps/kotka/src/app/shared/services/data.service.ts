import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dataset, ListResponse, SpecimenTransaction } from '@kotka/shared/models';
import { Observable } from 'rxjs';

export enum DataType {
  dataset = 'dataset',
  transaction = 'transaction'
}

export type DataObject = Dataset | SpecimenTransaction;

const path = '/api/';

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

  /*private getAll(type: DataType.dataset, page?: number, pageSize?: number, results?: Dataset[]): Observable<Dataset[]>;
  private getAll(type: DataType, page=1, pageSize=100, results: DataObject[]=[]): Observable<DataObject[]> {
    return this.getData(type, page, pageSize).pipe(
      switchMap(result => {
        results = results.concat(result.member);
        if (result.currentPage < result.lastPage) {
          return this.getAll(type, page + 1, pageSize, results);
        }
        return of(results);
      })
    );
  }*/
}
