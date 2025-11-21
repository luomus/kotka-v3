import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusResult } from '@kotka/shared/models';

const statusPath = '/api/status';

@Injectable({
  providedIn: 'root'
})

export class StatusService {
  private httpClient = inject(HttpClient);

  getApiStatus(): Observable<StatusResult> {
    return this.httpClient.get<StatusResult>(statusPath);
  }
}
