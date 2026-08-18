import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import {
  KotkaDocumentType,
  KotkaDocument,
  SpecimenDataType
} from '@kotka/shared/models';
import { ApiClient } from './api-client';
import { getId } from '@kotka/shared/utils';
import { isDocument } from '@luomus/laji-schema';

export interface DocumentDataResult<T extends KotkaDocumentType = KotkaDocumentType> {
  value?: KotkaDocument<T>;
  title?: string;
  loading: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentDataService {
  private apiClient = inject(ApiClient);

  getDocumentData<T extends KotkaDocumentType>(
    type: T,
    uri: string,
  ): Observable<DocumentDataResult<T>> {
    if (!uri) {
      return of({ loading: false, error: 'Resource not found' });
    }

    const id = getId(uri);
    return this.apiClient.getDocumentById(type, id).pipe(
      map((value) => ({
        value,
        title: this.getTitle(uri, value),
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

  private getTitle(
    uri: string,
    document?: KotkaDocument
  ) {
    if (isDocument(document)) {
      const dataType: SpecimenDataType | string | undefined = document.datatype;
      if (dataType === 'accession') {
        return `Accession ${uri}` + (document.originalSpecimenID ? ` (${document.originalSpecimenID})` : '');
      }
    }

    return uri;
  }
}


