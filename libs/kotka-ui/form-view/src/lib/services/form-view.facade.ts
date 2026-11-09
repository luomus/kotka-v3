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
  KotkaDocument,
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

export interface FormViewInputs<T extends KotkaMainDocumentType>
  extends Omit<
    FormInputs<KotkaDocument<T>>,
    'allowEdit' | 'allowDelete'
  > {
  dataType: T;
  dataURI?: string;
}

@Injectable()
export class FormViewFacade<T extends KotkaMainDocumentType> extends FormFacade<KotkaDocument<T>, FormViewInputs<T>> {
  private userService = inject(UserService);
  private apiClient = inject(ApiClient);

  protected override getStateForInputs$(inputs: FormViewInputs<T>): Observable<FormState<KotkaDocument<T>>> {
    return forkJoin([
      this.getAugmentedForm$(inputs),
      this.getInitialFormData$(inputs),
    ]).pipe(
      map(([form, formData]) => {
        const user = this.userService.user();

        return this.getInitialFormState(form, {
          formData,
          editMode: inputs.editMode,
          hasChanges: inputs.hasChanges,
          allowCopy: inputs.allowCopy,
          allowEdit: user ? allowEditForUser(formData, user) : false,
          allowDelete: user ? allowDeleteForUser(formData, user) : false,
        });
      }),
    );
  }

  private getInitialFormData$(
    inputs: FormViewInputs<T>,
  ): Observable<Partial<KotkaDocument<T>>> {
    if (inputs.editMode) {
      if (inputs.formData) {
        return of(inputs.formData);
      }
      return this.getFormData$(inputs.dataType, inputs.dataURI);
    } else {
      return of(this.getEmptyFormData$(inputs.formData));
    }
  }

  private getEmptyFormData$(
    prefilledFormData?: Partial<KotkaDocument<T>>,
  ): Partial<KotkaDocument<T>> {
    const formData: Partial<KotkaDocument<T>> = {};
    const user = this.userService.user();

    if (user?.organisation && user.organisation.length === 1) {
      formData.owner = user.organisation[0];
    }

    return { ...formData, ...prefilledFormData };
  }

  private getFormData$(dataType: T, dataURI?: string): Observable<Partial<KotkaDocument<T>>> {
    const dataTypeName = getDataTypeName(dataType, true);

    if (!dataURI) {
      return throwError(() => new FormStateError(`${dataTypeName} not found`));
    }

    const id = getId(dataURI);
    return this.apiClient.getDocumentById<T>(dataType, id).pipe(
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
