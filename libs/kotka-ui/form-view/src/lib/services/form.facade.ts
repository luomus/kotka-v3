import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { FormService } from '@kotka/ui/core';
import {
  concat,
  Observable,
  of,
  Subscription,
  switchMap
} from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LajiForm } from '@kotka/shared/models';
import { toObservable } from '@angular/core/rxjs-interop';
import { getDefaultFormState } from '@luomus/laji-form/lib/utils';
import { FormData } from '@kotka/ui/laji-form';

export interface FormInputs<T extends FormData> {
  formId: string;
  editMode: boolean;
  formData?: Partial<T>;
  hasChanges?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowCopy?: boolean;
  augmentFormFunc?: (
    form: LajiForm.SchemaForm,
  ) => Observable<LajiForm.SchemaForm>;
}

export interface FormState<T extends FormData> {
  loading: boolean;
  error?: string;
  form?: LajiForm.SchemaForm;
  formData?: Partial<T>; // Contains up-to-date form data with all the user changes
  formDataLastForceUpdatedVersion?: Partial<T>; // This is updated when the form data needs to be changed from the parent component. Using this as an input to the form component instead of the formData improves performance since this doesn't change so often
  disabled?: boolean;
  showDeleteButton?: boolean;
  showCopyButton?: boolean;
  formHasChanges?: boolean;
  disabledAlertDismissed?: boolean;
}

export class FormStateError extends Error {}

@Injectable()
export class FormFacade<T extends FormData, I extends object = FormInputs<T>> implements OnDestroy {
  private formService = inject(FormService);

  private store = signal<FormState<T>>({ loading: false });
  state = this.store.asReadonly();

  formData = computed(() => this.state()?.formData);
  disabled = computed(() => this.state()?.disabled);

  private inputs = signal<I | undefined>(undefined);

  private initialStateSub: Subscription;

  constructor() {
    this.initialStateSub = this.getInitialStateSub();
  }

  ngOnDestroy() {
    this.initialStateSub.unsubscribe();
  }

  setInputs(inputs: I) {
    this.inputs.set(inputs);
  }

  setFormData(
    formData: Partial<T>,
    formHasChanges = true,
    forceUpdate = false,
  ) {
    const state = this.state();

    const formDataLastForceUpdatedVersion = forceUpdate
      ? formData
      : state.formDataLastForceUpdatedVersion;

    this.setState({
      ...state,
      formData,
      formDataLastForceUpdatedVersion,
      formHasChanges,
    });
  }

  setFormHasChanges(formHasChanges: boolean) {
    this.setState({ ...this.state(), formHasChanges });
  }

  setDisabledAlertDismissed(disabledAlertDismissed: boolean) {
    this.setState({ ...this.state(), disabledAlertDismissed });
  }

  private getInitialStateSub(): Subscription {
    return toObservable(this.inputs).pipe(
      filter((inputs) => !!inputs),
      switchMap((inputs) =>
        concat(
          of({ loading: true }),
          this.getStateForInputs$(inputs),
        ),
      ),
    )
    .subscribe({
      next: (state: FormState<T>) => {
        this.setState(state);
      },
      error: (err) => {
        const error =
          err instanceof FormStateError
            ? err.message
            : 'An unexpected error occurred';

        this.setState({
          loading: false,
          error
        });
      },
    });
  }

  protected getStateForInputs$(inputs: I): Observable<FormState<T>> {
    const formInputs = inputs as unknown as FormInputs<T>;
    return this.getAugmentedForm$(formInputs).pipe(
      map((form) => this.getInitialFormState(form, formInputs)),
    );
  }

  protected getAugmentedForm$(
    inputs: Pick<FormInputs<T>, 'formId' | 'augmentFormFunc'>,
  ): Observable<LajiForm.SchemaForm> {
    return this.formService
      .getFormWithUserContext(inputs.formId)
      .pipe(
        switchMap((form) =>
          inputs.augmentFormFunc ? inputs.augmentFormFunc(form) : of(form),
        ),
      );
  }

  protected getInitialFormState(
    form: LajiForm.SchemaForm,
    inputs: Pick<FormInputs<T>, 'formData' | 'editMode' | 'hasChanges' | 'allowEdit' | 'allowDelete' | 'allowCopy'>,
  ): FormState<T> {
    let formData = inputs.formData || {};
    formData = getDefaultFormState(form.schema, formData, form.schema);

    const isEditMode = inputs.editMode;
    const disabled = isEditMode && !inputs.allowEdit;
    const showDeleteButton = isEditMode && !disabled && inputs.allowDelete;
    const showCopyButton = isEditMode && !disabled && inputs.allowCopy;

    return {
      loading: false,
      form,
      formData,
      formDataLastForceUpdatedVersion: formData,
      disabled,
      showDeleteButton,
      showCopyButton,
      formHasChanges: inputs.hasChanges || false,
      disabledAlertDismissed: false,
    };
  }

  private setState(state: FormState<T>) {
    this.store.set(state);
  }
}
