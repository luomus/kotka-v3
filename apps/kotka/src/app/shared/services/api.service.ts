import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dataset, ListResponse } from '@kotka/shared/models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export enum DataType {
  dataset = 'dataset'
}

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

  getById(type: DataType, id: string): Observable<Dataset> {
    return this.httpClient.get<Dataset>(path + type + '/' + id);
  }

  private getAll(type: DataType): Observable<Dataset[]> {
    return this.httpClient.get<ListResponse<Dataset>>(path + type).pipe(
      map(result => result.member)
    );
  }
}
