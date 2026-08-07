import {
  Component,
  computed,
  inject,
  input,
  Signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  catchError,
  map,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import {
  DocumentDataResult,
  DocumentDataService,
  FormService,
  LabelPipe,
  ToFullUriPipe,
  UserService,
} from '@kotka/ui/core';
import { allowEditForUser } from '@kotka/shared/utils';
import {
  ViewerComponent as UiViewerComponent,
  ViewerField,
} from '@kotka/ui/viewer';
import { AsyncPipe, DatePipe } from '@angular/common';
import {
  DocumentNavigatorComponent,
  MainContentComponent,
  SpinnerComponent,
} from '@kotka/ui/components';
import { NgbAlert, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, Observable, of } from 'rxjs';
import {
  Document,
  KotkaRootDocumentType,
  LajiForm,
  SpecimenDataType,
} from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { toObservable } from '@angular/core/rxjs-interop';

interface FormDataResult {
  value?: LajiForm.JsonForm;
  loading: boolean;
  error?: string;
}

interface ViewModel {
  specimenDataType?: SpecimenDataType | string;
  document?: Document;
  fields?: LajiForm.Field[];
  showEditButton?: boolean;
  loading: boolean;
  error?: string;
}

@Component({
  selector: 'kotka-specimen-viewer',
  templateUrl: './specimen-viewer.component.html',
  imports: [
    UiViewerComponent,
    SpinnerComponent,
    NgbAlert,
    AsyncPipe,
    MainContentComponent,
    RouterLink,
    DocumentNavigatorComponent,
    NgbPopover,
    LabelPipe,
    DatePipe,
    ToFullUriPipe,
  ],
  styleUrls: ['./specimen-viewer.component.scss'],
})
export class SpecimenViewerComponent {
  private documentDataService = inject(DocumentDataService);
  private formService = inject(FormService);
  private userService = inject(UserService);

  uri = input.required<string>();

  uri$ = toObservable(this.uri);
  dataType = KotkaRootDocumentType.specimen;

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

  documentData$: Observable<DocumentDataResult<KotkaRootDocumentType.specimen>> = this.uri$.pipe(
    switchMap((uri) =>
      this.documentDataService.getDocumentData(
        KotkaRootDocumentType.specimen, uri
      ),
    ),
    shareReplay(1),
  );

  vm$: Observable<ViewModel> = combineLatest([
    this.formData$,
    this.documentData$,
    this.userService.getCurrentLoggedInUser(),
  ]).pipe(
    map(([formData, documentData, user]) => {
      const loading = formData.loading || documentData.loading;
      const error = formData.error || documentData.error;

      return {
        specimenDataType: documentData.value?.datatype,
        fields: formData.value && this.getFields(formData.value.fields),
        document: documentData.value,
        showEditButton:
          documentData.value && allowEditForUser(documentData.value, user),
        loading,
        error,
      };
    }),
    startWith({ loading: true }),
  );

  private filteredFields = [
    'datatype',
    'owner',
    'gatherings.units.primarySpecimen',
  ];

  private unitLabelTpl = viewChild<TemplateRef<unknown>>('unitLabelTpl');
  private sampleLabelTpl = viewChild<TemplateRef<unknown>>('sampleLabelTpl');

  private customLabelTemplates: Signal<
    Record<string, TemplateRef<unknown> | undefined>
  > = computed(() => ({
    'gatherings.units': this.unitLabelTpl(),
    'gatherings.units.samples': this.sampleLabelTpl(),
  }));

  private getFields(fields: LajiForm.Field[], path = ''): ViewerField[] {
    return fields
      .filter((field): boolean => {
        return !this.filteredFields.includes(`${path}${field.name}`);
      })
      .map((field): ViewerField => {
        const fullName = `${path}${field.name}`;

        if (field.fields) {
          return {
            ...field,
            fields: this.getFields(field.fields, `${fullName}.`),
            collectionLabelTemplate: this.customLabelTemplates()[fullName],
          };
        }

        return field;
      });
  }
}
