import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

const AUTOCOMPLETE_ORGANIZATION_RESOURCE = '/autocomplete/organization';

@Injectable({
  providedIn: 'root'
})
export class FormApiClient {
  private basePath = '/api/laji';

  constructor(
    private httpClient: HttpClient
  ) { }

  public fetch(
    resource: string,
    query: any,
    options?: {method?: string; body?: any; headers?: {[header: string]: string | string[]}}
  ): Promise<any> {
    const path = this.basePath + resource;

    const queryParameters = {...query};

    if (!options) {
      options = {};
    }

    switch (resource) {
      case AUTOCOMPLETE_ORGANIZATION_RESOURCE:
        queryParameters['includePersonToken'] = true;
    }

    return this.httpClient.request(
      options['method'] || 'GET',
      path,
      {
        headers: {...options['headers'], timeout: '120000'},
        params: queryParameters,
        body: options['body'] || undefined,
        observe: 'response'
      }
    ).pipe(
      map((response) => ({...response, json: () => response.body})),
      catchError(err => of({...err, json: () => err.error}))
    ).toPromise(Promise);
  }
}
