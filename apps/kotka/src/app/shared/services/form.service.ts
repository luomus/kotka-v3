import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Form } from '../../../../../../libs/shared/models/src/models/LajiForm';

@Injectable({
  providedIn: 'root'
})

export class FormService {
  constructor(
    private httpClient: HttpClient
  ) {}

  getForm(formId: string): Observable<Form.SchemaForm> {
    return this.httpClient.get<Form.SchemaForm>('https://dev.laji.fi/api/forms/' + formId);
  }
}
