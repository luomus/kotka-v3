import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { FormlyConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { isObservable, Observable, of } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

export interface ValidationMessageOption {
  name: string;
  message:
    | string
    | ((error: any, field: FormlyFieldConfig) => string | Observable<string>);
}

@Component({
  selector: 'luomus-validation-message',
  template: `{{ errorMessage$ | async }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LuomusValidationMessage implements OnChanges {
  @Input() field?: FormlyFieldConfig;
  errorMessage$: Observable<string> = of('');

  constructor(private formlyConfig: FormlyConfig) {}

  ngOnChanges() {
    if (!this.field?.formControl) {
      return;
    }
    this.errorMessage$ = this.field.formControl.statusChanges.pipe(
      startWith(null),
      switchMap(() =>
        isObservable(this.errorMessage)
          ? this.errorMessage
          : of(this.errorMessage)
      )
    );
  }

  get errorMessage(): string | Observable<string> {
    if (!this.field?.formControl) {
      return '';
    }
    const fieldForm = this.field.formControl;
    for (const error in fieldForm.errors) {
      if (Object.prototype.hasOwnProperty.call(fieldForm.errors, error)) {
        let message: ValidationMessageOption['message'] = this.formlyConfig.getValidatorMessage(
          error
        );

        if (
          fieldForm.errors[error] !== null &&
          typeof fieldForm.errors[error] === 'object'
        ) {
          if (fieldForm.errors[error].errorPath) {
            return '';
          }

          if (fieldForm.errors[error].message) {
            message = fieldForm.errors[error].message;
          }
        }

        if (
          this.field.validation &&
          this.field.validation.messages &&
          this.field.validation.messages[error]
        ) {
          message = this.field.validation.messages[error];
        }

        if (
          this.field.validators &&
          this.field.validators[error] &&
          this.field.validators[error].message
        ) {
          message = this.field.validators[error].message;
        }

        if (
          this.field.asyncValidators &&
          this.field.asyncValidators[error] &&
          this.field.asyncValidators[error].message
        ) {
          message = this.field.asyncValidators[error].message;
        }

        if (typeof message === 'function') {
          return message(fieldForm.errors[error], this.field);
        }

        return message;
      }
    }
    return '';
  }
}
