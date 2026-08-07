import { inject, Injectable } from '@angular/core';
import { ApiClient, getDataTypeName, UserService } from '@kotka/ui/core';
import {
  catchError,
  forkJoin,
  Observable,
  of,
  throwError,
} from 'rxjs';
import { map } from 'rxjs/operators';
import {
  KotkaRootDocumentMap,
  KotkaMainDocumentType,
} from '@kotka/shared/models';
import {
  FormFacade,
  FormInputs,
  FormState,
  FormStateError,
} from './form.facade';
import {
  allowDeleteForUser,
  allowEditForUser,
  getId,
} from '@kotka/shared/utils';

export interface FormViewInputs<
  T extends KotkaMainDocumentType,
  S extends KotkaRootDocumentMap[T],
> extends Omit<FormInputs<S>, 'allowEdit' | 'allowDelete'> {
  dataType: T;
  dataURI?: string;
}

@Injectable()
export class FormViewFacade<
  T extends KotkaMainDocumentType,
  S extends KotkaRootDocumentMap[T],
> extends FormFacade<S, FormViewInputs<T, S>> {
  private userService = inject(UserService);
  private apiClient = inject(ApiClient);

  protected override getStateForInputs$(inputs: FormViewInputs<T, S>): Observable<FormState<S>> {
    return forkJoin([
      this.getAugmentedForm$(inputs),
      this.getInitialFormData$(inputs),
      this.userService.getCurrentLoggedInUser(),
    ]).pipe(
      map(([form, formData, user]) =>
        this.getInitialFormState(form, {
          formData,
          editMode: inputs.editMode,
          hasChanges: inputs.hasChanges,
          allowCopy: inputs.allowCopy,
          allowEdit: allowEditForUser(formData, user),
          allowDelete: allowDeleteForUser(formData, user),
        })
      ),
    );
  }

  private getInitialFormData$(
    inputs: FormViewInputs<T, S>,
  ): Observable<Partial<S>> {
    if (inputs.editMode) {
      if (inputs.formData) {
        return of(inputs.formData);
      }
      return this.getFormData$(inputs.dataType, inputs.dataURI);
    } else {
      return this.getEmptyFormData$(inputs.formData);
    }
  }

  private getEmptyFormData$(
    prefilledFormData?: Partial<S>,
  ): Observable<Partial<S>> {
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
    const dataTypeName = getDataTypeName(dataType, true);

    if (!dataURI) {
      return throwError(() => new FormStateError(`${dataTypeName} not found`));
    }

    const id = getId(dataURI);
    return this.apiClient.getDocumentById<T, S>(dataType, id).pipe(
      catchError((err) => {
        err =
          err.status === 404
            ? new FormStateError(`${dataTypeName} with URI ${dataURI} not found`)
            : err;
        return throwError(() => err);
      }),
    );
  }
}
