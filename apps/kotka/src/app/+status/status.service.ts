import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusResponse } from '@kotka/api-interfaces';

const statusPath = '/api/status';

@Injectable({
  providedIn: 'root'
})

export class StatusService {
  constructor(
    private httpClient: HttpClient
  ) {}

  getApiStatus(): Observable<StatusResponse> {
    return this.httpClient.get<StatusResponse>(statusPath);
  }
}
