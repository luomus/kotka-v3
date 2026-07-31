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
      return of<DocumentDataResult<T>>({ loading: false, error: 'Resource not found' });
    }

    const id = getId(uri);
    return this.apiClient.getDocumentById(type, id).pipe(
      map((value) => ({
        value,
        loading: false as const,
      })),
      startWith({ loading: true as const } as DocumentDataResult<T>),
      catchError(() => {
        return of<DocumentDataResult<T>>({
          loading: false,
          error: `Resource with URI ${uri} not found`,
        });
      }),
    );
  }
}


