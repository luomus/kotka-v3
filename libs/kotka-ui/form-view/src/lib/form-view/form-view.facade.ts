import { computed, Injectable, OnDestroy, signal, inject } from '@angular/core';
import { ApiClient, FormService, UserService } from '@kotka/ui/services';
import {
  catchError,
  concat,
  forkJoin,
  Observable,
  of,
  Subscription,
  switchMap, throwError
} from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
  allowEditForUser,
  allowDeleteForUser,
  getId,
} from '@kotka/shared/utils';
import {
  KotkaDocumentObject,
  KotkaDocumentObjectType,
  KotkaDocumentObjectMap,
  LajiForm,
  Person,
} from '@kotka/shared/models';
import { toObservable } from '@angular/core/rxjs-interop';

export enum FormErrorEnum {
  dataNotFound = 'dataNotFound',
  genericError = 'genericError',
}

export interface FormInputs<T extends KotkaDocumentObjectType, S extends KotkaDocumentObjectMap[T]> {
  formId: string;
  dataType: T;
  editMode: boolean;
  dataURI?: string;
  allowCopy?: boolean;
  augmentFormFunc?: (
    form: LajiForm.SchemaForm,
  ) => Observable<LajiForm.SchemaForm>;
  prefilledFormData?: Partial<S>;
}

export interface FormState<S extends KotkaDocumentObject> {
  loading: boolean;
  errorType?: FormErrorEnum;
  form?: LajiForm.SchemaForm;
  formData?: Partial<S>; // Contains up-to-date form data with all the user changes
  formDataLastForceUpdatedVersion?: Partial<S>; // This is updated when the form data needs to be changed from the parent component. Using this as an input to the form component instead of the formData improves performance since this doesn't change so often
  disabled?: boolean;
  showDeleteButton?: boolean;
  showCopyButton?: boolean;
  formHasChanges?: boolean;
  disabledAlertDismissed?: boolean;
  showDeleteTargetInUseAlert?: boolean;
}

@Injectable()
export class FormViewFacade<
  T extends KotkaDocumentObjectType,
  S extends KotkaDocumentObjectMap[T],
> implements OnDestroy
{
  private userService = inject(UserService);
  private formService = inject(FormService);
  private apiClient = inject(ApiClient);

  private store = signal<FormState<S>>({ loading: false });
  state = this.store.asReadonly();

  formData = computed(() => (this.state()?.formData));
  disabled = computed(() => (this.state()?.disabled));

  private inputs = signal<FormInputs<T, S>|undefined>(undefined);

  private initialStateSub: Subscription;

  constructor() {
    this.initialStateSub = this.getInitialStateSub();
  }

  ngOnDestroy() {
    this.initialStateSub.unsubscribe();
  }

  setInputs(inputs: FormInputs<T, S>) {
    this.inputs.set(inputs);
  }

  setFormData(formData: Partial<S>, formHasChanges = true, forceUpdate = false) {
    const state = this.state();

    const formDataLastForceUpdatedVersion = forceUpdate ? formData : state.formDataLastForceUpdatedVersion;

    this.setState({ ...state, formData, formDataLastForceUpdatedVersion, formHasChanges });
  }

  setFormHasChanges(formHasChanges: boolean) {
    this.setState({ ...this.state(), formHasChanges });
  }

  setDisabledAlertDismissed(disabledAlertDismissed: boolean) {
    this.setState({ ...this.state(), disabledAlertDismissed });
  }

  setShowDeleteTargetInUseAlert(showDeleteTargetInUseAlert: boolean) {
    this.setState({ ...this.state(), showDeleteTargetInUseAlert });
  }

  private getInitialStateSub(): Subscription {
    return toObservable(this.inputs)
      .pipe(
        filter((inputs) => !!inputs),
        switchMap((inputs) =>
          concat(
            of({ loading: true }), // reset the state before the values load
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
        error: (err) => {
          const errorType =
            err.message === FormErrorEnum.dataNotFound
              ? FormErrorEnum.dataNotFound
              : FormErrorEnum.genericError;
          this.setState({ loading: false, errorType: errorType });
        },
      });
  }

  private getAugmentedForm$(
    inputs: FormInputs<T, S>,
  ): Observable<LajiForm.SchemaForm> {
    return this.formService
      .getFormWithUserContext(inputs.formId)
      .pipe(
        switchMap((form) =>
          inputs.augmentFormFunc ? inputs.augmentFormFunc(form) : of(form),
        ),
      );
  }

  private getInitialFormData$(inputs: FormInputs<T, S>): Observable<Partial<S>> {
    if (inputs.editMode) {
      return this.getFormData$(inputs.dataType, inputs.dataURI);
    } else {
      return this.getEmptyFormData$(inputs.prefilledFormData);
    }
  }

  private getEmptyFormData$(prefilledFormData?: Partial<S>): Observable<Partial<S>> {
    return this.userService.getCurrentLoggedInUser().pipe(
      map((user) => {
        const formData: Partial<S> = {};
        if (user?.organisation && user.organisation.length === 1) {
          formData.owner = user.organisation[0];
        }
        return { ...formData, ...prefilledFormData };
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
        err = err.status === 404 ? new Error(FormErrorEnum.dataNotFound) : err;
        return throwError(() => err);
      }),
    );
  }

  private getInitialFormState(
    inputs: FormInputs<T, S>,
    form: LajiForm.SchemaForm,
    formData: Partial<S>,
    user: Person,
  ): FormState<S> {
    const isEditMode = inputs.editMode;
    const disabled = isEditMode && !allowEditForUser(formData, user);
    const showDeleteButton =
      isEditMode && !disabled && allowDeleteForUser(<S>formData, user);

    return {
      loading: false,
      form,
      formData,
      formDataLastForceUpdatedVersion: formData,
      disabled,
      showDeleteButton,
      showCopyButton: isEditMode && inputs.allowCopy,
      formHasChanges: false,
      disabledAlertDismissed: false,
      showDeleteTargetInUseAlert: false,
    };
  }

  private setState(state: FormState<S>) {
    this.store.set(state);
  }
}
