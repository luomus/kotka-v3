import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'formly-horizontal-wrapper',
  template: `
    <div [ngClass]="field.templateOptions?.rowClassName">
      <label
        [for]="id"
        class="col-form-label"
        [ngClass]="field.templateOptions?.labelClassName"
      >
        {{ to.label }}
        <ng-container *ngIf="to.required && to.hideRequiredMarker !== true"
          >*&nbsp;</ng-container
        >
        <span *ngIf="to.description" [tooltip]="to.description">(?)</span>
      </label>
      <div [ngClass]="field.templateOptions?.inputClassName">
        <ng-template #fieldComponent></ng-template>
      </div>
    </div>
    <div class="row justify-content-end">
      <div
        *ngIf="showError"
        class="invalid-feedback d-block"
        [ngClass]="field.templateOptions?.inputClassName"
      >
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `,
})
export class FormlyHorizontalWrapper extends FieldWrapper {}
