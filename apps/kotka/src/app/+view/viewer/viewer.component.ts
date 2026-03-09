import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap, startWith, catchError, shareReplay } from 'rxjs/operators';
import { ApiClient, FormService, UserService } from '@kotka/ui/services';
import { getId, allowEditForUser } from '@kotka/shared/utils';
import { ViewerComponent as UiViewerComponent } from '@kotka/ui/viewer';
import { AsyncPipe } from '@angular/common';
import { SpinnerComponent } from '@kotka/ui/spinner';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, Observable, of } from 'rxjs';
import {
  KotkaDocumentObjectType,
  LajiForm,
  KotkaDocumentObject,
} from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { MainContentComponent } from '@kotka/ui/main-content';
import { DocumentNavigatorComponent } from '../../+specimens/document-navigator/document-navigator.component';

interface FormDataResult {
  value?: LajiForm.JsonForm;
  loading: boolean;
  error?: string;
}

interface DocumentDataResult {
  value?: KotkaDocumentObject;
  loading: boolean;
  error?: string;
}

interface ViewModel {
  document?: KotkaDocumentObject;
  form?: LajiForm.JsonForm;
  uri?: string;
  showEditButton?: boolean;
  loading: boolean;
  error?: string;
}

@Component({
  selector: 'kotka-viewer',
  templateUrl: './viewer.component.html',
  imports: [
    UiViewerComponent,
    SpinnerComponent,
    NgbAlert,
    AsyncPipe,
    MainContentComponent,
    RouterLink,
    DocumentNavigatorComponent,
  ],
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent {
  private route = inject(ActivatedRoute);
  private apiClient = inject(ApiClient);
  private formService = inject(FormService);
  private userService = inject(UserService);

  dataType = KotkaDocumentObjectType.specimen;
  uri$ = this.route.queryParams.pipe(map((params) => params['uri']));

  formData$: Observable<FormDataResult> = this.formService
    .getFormInJsonFormat(globals.specimenFormId)
    .pipe(
      map((value) => ({
        value,
        loading: false,
      })),
      startWith({ loading: true }),
      catchError(() => {
        return of({ loading: false, error: 'Failed to load form' });
      }),
      shareReplay(1),
    );

  documentData$: Observable<DocumentDataResult> = this.uri$.pipe(
    switchMap((uri) => {
      if (!uri) {
        return of({ loading: false, error: 'Resource not found' });
      }
      const id = getId(uri);
      return this.apiClient
        .getDocumentById(this.dataType, id)
        .pipe(
          map((value) => ({
            value,
            loading: false,
          })),
          startWith({ loading: true }),
          catchError(() => {
            return of({
              loading: false,
              error: `Resource with URI ${uri} not found`,
            });
          }),
        );
    }),
    shareReplay(1),
  );

  vm$: Observable<ViewModel> = combineLatest([
    this.formData$,
    this.documentData$,
    this.uri$,
    this.userService.getCurrentLoggedInUser(),
  ]).pipe(
    map(([formData, documentData, uri, user]) => {
      const loading = formData.loading || documentData.loading;
      const error = formData.error || documentData.error;

      return {
        form: formData.value,
        document: documentData.value,
        uri,
        showEditButton:
          documentData.value && allowEditForUser(documentData.value, user),
        loading,
        error,
      };
    }),
    startWith({ loading: true }),
  );
}


