import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LajiForm } from '@kotka/shared/models';

const path = '/api/form/';

@Injectable({
  providedIn: 'root'
})

export class FormService {
  constructor(
    private httpClient: HttpClient
  ) {}

  getForm(formId: string): Observable<LajiForm.SchemaForm> {
    return this.httpClient.get<LajiForm.SchemaForm>(path + formId);
  }
}
