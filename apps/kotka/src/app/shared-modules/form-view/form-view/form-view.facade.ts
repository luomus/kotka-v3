import { Injectable, OnDestroy } from '@angular/core';
import { ApiClient, FormService, UserService } from '@kotka/ui/data-services';
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
  throwError,
} from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import {
  allowEditForUser,
  allowDeleteForUser,
  getId,
} from '@kotka/shared/utils';
import {
  KotkaDocumentObject,
  KotkaDocumentObjectType,
  KotkaDocumentObjectMap,
} from '@kotka/shared/models';
import { LajiForm, Person, Image } from '@kotka/shared/models';
import { MediaMetadata } from '@luomus/laji-form/lib/components/LajiForm';

export enum FormErrorEnum {
  dataNotFound = 'dataNotFound',
  genericError = 'genericError',
}

export interface FormInputs<T extends KotkaDocumentObjectType> {
  formId: string;
  dataType: T;
  editMode: boolean;
  dataURI?: string;
  augmentFormFunc?: (
    form: LajiForm.SchemaForm,
  ) => Observable<LajiForm.SchemaForm>;
}

export interface FormState<S extends KotkaDocumentObject> {
  form?: LajiForm.SchemaForm;
  formData?: Partial<S>;
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

export type ViewModel<S extends KotkaDocumentObject> =
  | FormState<S>
  | ErrorViewModel;

export function isSuccessViewModel<S extends KotkaDocumentObject>(
  viewModel: ViewModel<S>,
): viewModel is FormState<S> {
  return !isErrorViewModel(viewModel);
}
export function isErrorViewModel<S extends KotkaDocumentObject>(
  viewModel: ViewModel<S>,
): viewModel is ErrorViewModel {
  return 'errorType' in viewModel;
}

interface KotkaMediaMetadata extends MediaMetadata {
  publicityRestrictions?: Image['publicityRestrictions'];
}

@Injectable()
export class FormViewFacade<
  T extends KotkaDocumentObjectType,
  S extends KotkaDocumentObjectMap[T],
> implements OnDestroy
{
  private store = new ReplaySubject<FormState<S>>(1);
  state$ = this.store.asObservable();

  formData$ = this.state$.pipe(
    map((state) => state.formData),
    distinctUntilChanged(),
  );
  disabled$ = this.state$.pipe(
    map((state) => state.disabled),
    distinctUntilChanged(),
  );

  vm$: Observable<ViewModel<S>>;

  private inputs$ = new ReplaySubject<FormInputs<T>>(1);

  private initialStateSub: Subscription;

  private _state: FormState<S> = {};

  constructor(
    private userService: UserService,
    private formService: FormService,
    private apiClient: ApiClient,
  ) {
    this.vm$ = this.getVm$();
    this.initialStateSub = this.getInitialStateSub();
  }

  ngOnDestroy() {
    this.initialStateSub.unsubscribe();
  }

  setInputs(inputs: FormInputs<T>) {
    this.inputs$.next(inputs);
  }

  setFormData(formData: Partial<S>, formHasChanges = true) {
    const mediaMetadata = this._state.mediaMetadata
      ? {
          ...this._state.mediaMetadata,
          intellectualOwner: formData.owner || '',
        }
      : undefined;
    this.setState({ ...this._state, formData, formHasChanges, mediaMetadata });
  }

  setCopiedFormData(formData: Partial<S>) {
    this.getEmptyFormData$()
      .pipe(take(1))
      .subscribe((emptyFormData) => {
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

  private getVm$(): Observable<ViewModel<S>> {
    return this.inputs$.pipe(
      switchMap(() =>
        this.state$.pipe(
          catchError((err) => {
            const errorType =
              err.message === FormErrorEnum.dataNotFound
                ? FormErrorEnum.dataNotFound
                : FormErrorEnum.genericError;
            return of({ errorType });
          }),
        ),
      ),
      shareReplay(1),
    );
  }

  private getAugmentedForm$(
    inputs: FormInputs<T>,
  ): Observable<LajiForm.SchemaForm> {
    return this.formService
      .getFormWithUserContext(inputs.formId)
      .pipe(
        switchMap((form) =>
          inputs.augmentFormFunc ? inputs.augmentFormFunc(form) : of(form),
        ),
      );
  }

  private getInitialFormData$(inputs: FormInputs<T>): Observable<Partial<S>> {
    if (inputs.editMode) {
      return this.getFormData$(inputs.dataType, inputs.dataURI);
    } else {
      return this.getEmptyFormData$();
    }
  }

  private getEmptyFormData$(): Observable<Partial<S>> {
    return this.userService.getCurrentLoggedInUser().pipe(
      map((user) => {
        const formData: Partial<S> = {};
        if (user?.organisation && user.organisation.length === 1) {
          formData.owner = user.organisation[0];
        }
        return formData;
      }),
    );
  }

  private getFormData$(dataType: T, dataURI?: string): Observable<Partial<S>> {
    if (!dataURI) {
      return throwError(() => new Error(FormErrorEnum.dataNotFound));
    }

    const id = getId(dataURI);
    return this.apiClient.getDocumentById<T, S>(dataType, id).pipe(
      catchError((err) => {
        err = err.status === 404 ? FormErrorEnum.dataNotFound : err;
        return throwError(() => new Error(err));
      }),
    );
  }

  private getInitialStateSub(): Subscription {
    return this.inputs$
      .pipe(
        switchMap((inputs) =>
          concat(
            of({}), // set the state first as empty object before the values load
            forkJoin([
              this.getAugmentedForm$(inputs),
              this.getInitialFormData$(inputs),
              this.userService.getCurrentLoggedInUser(),
            ]).pipe(
              map(([form, formData, user]) =>
                this.getInitialFormState(inputs, form, formData, user),
              ),
            ),
          ),
        ),
      )
      .subscribe({
        next: (state: FormState<S>) => {
          this.setState(state);
        },
        error: (err) => this.store.error(err),
      });
  }

  private getInitialFormState(
    inputs: FormInputs<T>,
    form: LajiForm.SchemaForm,
    formData: Partial<S>,
    user: Person,
  ): FormState<S> {
    const isEditMode = inputs.editMode;
    const disabled = isEditMode && !allowEditForUser(formData, user);
    const showDeleteButton =
      isEditMode && !disabled && allowDeleteForUser(<S>formData, user);
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
      showDeleteTargetInUseAlert: false,
    };
  }

  private getMediaMetadata(
    user: Person,
    formData: Partial<S>,
  ): KotkaMediaMetadata {
    return {
      intellectualRights: 'MZ.intellectualRightsARR',
      intellectualOwner: formData.owner || '',
      capturerVerbatim: user.fullName,
      publicityRestrictions: 'MZ.publicityRestrictionsPrivate',
    };
  }

  private setState(state: FormState<S>) {
    this._state = state;
    this.store.next(this._state);
  }
}
