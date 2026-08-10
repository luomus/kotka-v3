import { inject, Injectable } from '@angular/core';
import {
  DocumentDataService,
  FormService,
  UserService,
} from '@kotka/ui/core';
import { allowEditForUser } from '@kotka/shared/utils';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import {
  Document,
  KotkaRootDocumentType,
  LajiForm,
  SpecimenDataType,
} from '@kotka/shared/models';
import { globals } from '../../../environments/globals';

export interface SpecimenViewerViewModel {
  specimenDataType?: SpecimenDataType | string;
  document?: Document;
  fields?: LajiForm.Field[];
  showEditButton?: boolean;
  loading: boolean;
  error?: string;
}

interface FormDataResult {
  value?: LajiForm.JsonForm;
  loading: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class SpecimenViewerDataService {
  private documentDataService = inject(DocumentDataService);
  private formService = inject(FormService);
  private userService = inject(UserService);

  private formData$: Observable<FormDataResult> = this.formService
    .getFormInJsonFormat(globals.specimenFormId)
    .pipe(
      map((value) => ({ value, loading: false })),
      startWith({ loading: true }),
      catchError(() => of({ loading: false, error: 'Failed to load form' })),
      shareReplay(1),
    );

  getViewModel$(uri$: Observable<string>): Observable<SpecimenViewerViewModel> {
    const documentData$ = uri$.pipe(
      switchMap((uri) =>
        this.documentDataService.getDocumentData(KotkaRootDocumentType.specimen, uri),
      ),
      shareReplay(1),
    );

    return combineLatest([
      this.formData$,
      documentData$,
      this.userService.getCurrentLoggedInUser(),
    ]).pipe(
      map(([formData, documentData, user]) => ({
        specimenDataType: documentData.value?.datatype,
        fields: formData.value?.fields,
        document: documentData.value,
        showEditButton: documentData.value && allowEditForUser(documentData.value, user),
        loading: formData.loading || documentData.loading,
        error: formData.error || documentData.error,
      })),
      startWith({ loading: true }),
    );
  }
}

