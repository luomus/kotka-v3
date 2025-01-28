import { Injectable, OnDestroy } from '@angular/core';
import { ApiClient, FormService, UserService } from '@kotka/services';
import {
  catchError,
  concat,
  forkJoin,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  Subscription,
  switchMap,
  throwError
} from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { allowEditForUser, allowDeleteForUser } from '@kotka/utils';
import { KotkaDocumentObject, KotkaDocumentObjectType } from '@kotka/shared/models';
import { LajiForm, Person, Image } from '@kotka/shared/models';
import { FormViewUtils } from './form-view-utils';
import { MediaMetadata } from '@luomus/laji-form/lib/components/LajiForm';

export enum FormErrorEnum {
  dataNotFound = 'dataNotFound',
  genericError = 'genericError'
}

export interface FormInputs {
  formId: string;
  dataType: KotkaDocumentObjectType;
  editMode: boolean;
  dataURI?: string;
  augmentFormFunc?: (form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>;
}

export interface FormState {
  form?: LajiForm.SchemaForm;
  formData?: Partial<KotkaDocumentObject>;
  disabled?: boolean;
  showDeleteButton?: boolean;
  showCopyButton?: boolean;
  mediaMetadata?: KotkaMediaMetadata;
  formHasChanges?: boolean;
  disabledAlertDismissed?: boolean;
  showDeleteTargetInUseAlert?: boolean;
}

export interface ErrorViewModel {
  errorType: FormErrorEnum;
}

export type ViewModel = FormState | ErrorViewModel;

export function isSuccessViewModel(viewModel: ViewModel): viewModel is FormState {
  return !isErrorViewModel(viewModel);
}
export function isErrorViewModel(viewModel: ViewModel): viewModel is ErrorViewModel {
  return 'errorType' in viewModel;
}

interface KotkaMediaMetadata extends MediaMetadata {
  publicityRestrictions?: Image['publicityRestrictions']
}

@Injectable()
export class FormViewFacade implements OnDestroy {
  private store  = new ReplaySubject<FormState>(1);
  state$ = this.store.asObservable();

  formData$ = this.state$.pipe(map(state => state.formData), distinctUntilChanged());
  disabled$ = this.state$.pipe(map(state => state.disabled), distinctUntilChanged());

  vm$: Observable<ViewModel>;

  private inputs$ = new ReplaySubject<FormInputs>(1);

  private initialStateSub: Subscription;

  private _state: FormState = {};

  constructor(
    private userService: UserService,
    private formService: FormService,
    private apiClient: ApiClient
  ) {
    this.vm$ = this.getVm$();
    this.initialStateSub = this.getInitialStateSub();
  }

  ngOnDestroy() {
    this.initialStateSub.unsubscribe();
  }

  setInputs(inputs: FormInputs) {
    this.inputs$.next(inputs);
  }

  setFormData(formData: Partial<KotkaDocumentObject>, formHasChanges = true) {
    const mediaMetadata = this._state.mediaMetadata ? { ...this._state.mediaMetadata, intellectualOwner: formData.owner || ''} : undefined;
    this.setState({ ...this._state, formData, formHasChanges, mediaMetadata });
  }

  setCopiedFormData(formData: Partial<KotkaDocumentObject>) {
    this.getEmptyFormData$().pipe(take(1)).subscribe(emptyFormData => {
      formData = { ...emptyFormData, ...formData };
      this.setFormData(formData, false);
    });
  }

  setFormHasChanges(formHasChanges: boolean) {
    this.setState({ ...this._state, formHasChanges });
  }

  setDisabledAlertDismissed(disabledAlertDismissed: boolean) {
    this.setState({ ...this._state, disabledAlertDismissed });
  }

  setShowDeleteTargetInUseAlert(showDeleteTargetInUseAlert: boolean) {
    this.setState({ ...this._state, showDeleteTargetInUseAlert });
  }

  private getVm$(): Observable<ViewModel> {
    return this.inputs$.pipe(
      switchMap(() => this.state$.pipe(
        catchError(err => {
          const errorType = err.message === FormErrorEnum.dataNotFound ? FormErrorEnum.dataNotFound : FormErrorEnum.genericError;
          return of({ errorType });
        }))
      ),
      shareReplay(1)
    );
  }

  private getAugmentedForm$(inputs: FormInputs): Observable<LajiForm.SchemaForm> {
    return this.formService.getFormWithUserContext(inputs.formId).pipe(
      switchMap(form => inputs.augmentFormFunc ? inputs.augmentFormFunc(form) : of(form))
    );
  }

  private getInitialFormData$(inputs: FormInputs): Observable<Partial<KotkaDocumentObject>> {
    if (inputs.editMode) {
      return this.getFormData$(inputs.dataType, inputs.dataURI);
    } else {
      return this.getEmptyFormData$();
    }
  }

  private getEmptyFormData$(): Observable<Partial<KotkaDocumentObject>> {
    return this.userService.getCurrentLoggedInUser().pipe(map(user => {
      const formData: Partial<KotkaDocumentObject> = {};
      if (user?.organisation && user.organisation.length === 1) {
        formData.owner = user.organisation[0];
      }
      return formData;
    }));
  }

  private getFormData$(dataType: KotkaDocumentObjectType, dataURI?: string): Observable<Partial<KotkaDocumentObject>> {
    if (!dataURI) {
      return throwError(() => new Error(FormErrorEnum.dataNotFound));
    }

    const id = FormViewUtils.getIdFromDataURI(dataURI);
    return this.apiClient.getDocumentById(dataType, id).pipe(
      catchError(err => {
        err = err.status === 404 ? FormErrorEnum.dataNotFound : err;
        return throwError(() => new Error(err));
      })
    );
  }

  private getInitialStateSub(): Subscription {
    return this.inputs$.pipe(
      switchMap(inputs => concat(
        of({}), // set the state first as empty object before the values load
        forkJoin([
          this.getAugmentedForm$(inputs),
          this.getInitialFormData$(inputs),
          this.userService.getCurrentLoggedInUser()
        ]).pipe(
          map(([form, formData, user]) => (
            this.getInitialFormState(inputs, form, formData, user)
          ))
        )
      ))
    ).subscribe({
      'next': (state: FormState) => {
        this.setState(state);
      },
      'error': err => this.store.error(err)
    });
  }

  private getInitialFormState(inputs: FormInputs, form: LajiForm.SchemaForm, formData: Partial<KotkaDocumentObject>, user: Person): FormState {
    const isEditMode =  inputs.editMode;
    const disabled = isEditMode && !allowEditForUser(formData, user);
    const showDeleteButton = isEditMode && (!disabled && allowDeleteForUser(<KotkaDocumentObject>formData, user));
    const showCopyButton = isEditMode && !!form.options?.allowTemplate;

    return {
      form,
      formData,
      disabled,
      showDeleteButton,
      showCopyButton,
      mediaMetadata: this.getMediaMetadata(user, formData),
      formHasChanges: false,
      disabledAlertDismissed: false,
      showDeleteTargetInUseAlert: false
    };
  }

  private getMediaMetadata(user: Person, formData: Partial<KotkaDocumentObject>): KotkaMediaMetadata {
    return {
      intellectualRights: 'MZ.intellectualRightsARR',
      intellectualOwner: formData.owner || '',
      capturerVerbatim: user.fullName,
      publicityRestrictions: 'MZ.publicityRestrictionsPrivate'
    };
  }

  private setState(state: FormState) {
    this._state = state;
    this.store.next(this._state);
  }
}
