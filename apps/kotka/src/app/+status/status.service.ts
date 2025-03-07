import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusResult } from '@kotka/shared/models';

const statusPath = '/api/status';

@Injectable({
  providedIn: 'root'
})

export class StatusService {
  constructor(
    private httpClient: HttpClient
  ) {}

  getApiStatus(): Observable<StatusResult> {
    return this.httpClient.get<StatusResult>(statusPath);
  }
}
