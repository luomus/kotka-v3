import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { KotkaDocumentObjectType, KotkaDocumentObjectMap } from '@kotka/shared/models';
import { ApiClient } from './api-client';
import { getId } from '@kotka/shared/utils';

export interface DocumentDataResult<T extends KotkaDocumentObjectType = KotkaDocumentObjectType> {
  value?: KotkaDocumentObjectMap[T];
  loading: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentDataService {
  private apiClient = inject(ApiClient);

  getDocumentData<T extends KotkaDocumentObjectType>(type: T, uri: string): Observable<DocumentDataResult<T>> {
    if (!uri) {
      return of({ loading: false, error: 'Resource not found' });
    }

    const id = getId(uri);
    return this.apiClient.getDocumentById(type, id).pipe(
      map((value) => ({
        value,
        loading: false,
      })),
      startWith({ loading: true }),
      catchError((err) => {
        const error =
          err.status === 404
            ? `Resource with URI ${uri} not found`
            : 'An unexpected error occurred';

        return of({
          loading: false,
          error,
        });
      }),
    );
  }
}


