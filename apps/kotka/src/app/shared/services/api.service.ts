import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dataset, ListResponse } from '@kotka/shared/models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

enum ApiResultType {
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
    return this.getAll(ApiResultType.dataset);
  }

  getAll(type: ApiResultType): Observable<Dataset[]> {
    return this.httpClient.get<ListResponse<Dataset>>(path + type).pipe(
      map(result => result.member)
    );
  }
}
