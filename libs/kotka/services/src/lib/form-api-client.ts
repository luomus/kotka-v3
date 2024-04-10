import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastService } from './toast.service';
import { apiBase, lajiApiBase } from './constants';
import { getOrganizationFullName } from '@kotka/utils';
import { Organization } from '@luomus/laji-schema';
import { isMultiLanguageObject } from '@kotka/shared/models';
import { DialogService } from './dialog.service';
import { ErrorMessages } from '@kotka/api-interfaces';

enum ResourceType {
  autocompleteOrganizationResource,
  autocompleteCollectionResource,
  getOrganizationResource,
  getCollectionResource,
  validateResource,
  pdfResource,
  other
}

const pathIs: Record<string, ResourceType> = {
  '/autocomplete/organization': ResourceType.autocompleteOrganizationResource,
  '/autocomplete/collection': ResourceType.autocompleteCollectionResource,
  '/documents/validate': ResourceType.validateResource
};
const pathStartsWith: Record<string, ResourceType> = {
  '/organization/by-id': ResourceType.getOrganizationResource,
  '/collection/by-id': ResourceType.getCollectionResource,
  '/pdf': ResourceType.pdfResource
};

@Injectable({
  providedIn: 'root'
})
export class FormApiClient {
  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService,
    private dialogService: DialogService
  ) { }

  public fetch(
    resource: string,
    query: any,
    options?: {method?: string; body?: unknown; headers?: {[header: string]: string | string[]}}
  ): Promise<unknown> {
    const queryParameters = {...query};

    if (!options) {
      options = {};
    }

    let path: string;
    const resourceType = this.getResourceType(resource);

    switch (resourceType) {
      case ResourceType.autocompleteOrganizationResource:
        path = apiBase + '/organization/autocomplete';
        break;
      case ResourceType.autocompleteCollectionResource:
        path = apiBase + '/collection/autocomplete';
        break;
      case ResourceType.getOrganizationResource:
      case ResourceType.getCollectionResource:
        path = apiBase + resource.replace('/by-id', '');
        break;
      case ResourceType.validateResource:
        path = apiBase + '/validate';
        break;
      case ResourceType.pdfResource:
        if (options.method === 'DELETE') {
          return Promise.resolve({json: () => ''});
        }
        path = apiBase + `/media${resource}`;
        break;
      default:
        path = lajiApiBase + resource;
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
      map((response) => (
        {...response, json: () => (this.processResult(resourceType, response.body))})
      ),
      catchError(err => {
        if (resourceType === ResourceType.pdfResource && err.status === 400 && err.error?.message === ErrorMessages.missingIntellectualOwner) {
          this.dialogService.alert('Please fill the "Owner of record" field before attaching any files.');
        } else if (!(err.status === 404 || (resourceType === ResourceType.validateResource && err.status === 422))) {
          this.toastService.showGenericError({pause: true});
        }
        return of({...err, json: () => err.error});
      })
    ).toPromise(Promise);
  }

  private getResourceType(resource: string): ResourceType {
    if (pathIs[resource] !== undefined) {
      return pathIs[resource];
    }
    for (const path of Object.keys(pathStartsWith)) {
      if (resource.startsWith(path)) {
        return pathStartsWith[path];
      }
    }
    return ResourceType.other;
  }

  private processResult(resourceType: ResourceType, result: any) {
    if (resourceType === ResourceType.getOrganizationResource) {
      result = { ...result, fullName: getOrganizationFullName(result as Organization) };
    }
    if ([ResourceType.getOrganizationResource, ResourceType.getCollectionResource].includes(resourceType)) {
      result = this.processMultiLanguageObject(result);
    }

    return result;
  }

  private processMultiLanguageObject(object: any): any {
    if (Array.isArray(object)) {
      return object.map(item => this.processMultiLanguageObject(item));
    } else if (typeof object === 'object') {
      if (Object.keys(object).length === 0) {
        return undefined;
      }

      if (isMultiLanguageObject(object)) {
        return object.en;
      }

      const newObject: Record<string, any> = {};
      for (const key in object) {
        newObject[key] = this.processMultiLanguageObject(object[key]);
      }
      return newObject;
    }

    return object;
  }
}
