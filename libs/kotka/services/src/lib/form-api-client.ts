import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastService } from './toast.service';
import { apiBase, lajiApiBase } from './constants';

const AUTOCOMPLETE_ORGANIZATION_RESOURCE = '/autocomplete/organization';
const VALIDATE_RESOURCE = '/documents/validate';

@Injectable({
  providedIn: 'root'
})
export class FormApiClient {
  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
  ) { }

  public fetch(
    resource: string,
    query: any,
    options?: {method?: string; body?: unknown; headers?: {[header: string]: string | string[]}}
  ): Promise<unknown> {
    let path = lajiApiBase + resource;

    const queryParameters = {...query};

    if (!options) {
      options = {};
    }

    switch (resource) {
      case AUTOCOMPLETE_ORGANIZATION_RESOURCE:
        queryParameters['includePersonToken'] = true;
        break;
      case VALIDATE_RESOURCE:
        path = apiBase + '/validate';
        break;
      default:
        if (resource.startsWith('/pdf')) {
          if (options.method === 'DELETE') {
            return Promise.resolve({json: () => ''});
          }
          path = apiBase + `/media${resource}`;
        }
        break;
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
      catchError(err => {
        if (!(resource === VALIDATE_RESOURCE && err.status === 422)) {
          this.toastService.showGenericError({pause: true});
        }
        return of({...err, json: () => err.error});
      })
    ).toPromise(Promise);
  }
}
