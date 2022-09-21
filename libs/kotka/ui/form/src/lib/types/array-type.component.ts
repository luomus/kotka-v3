import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'formly-array-type',
  template: `
    <fieldset class="mb-3">
      <legend *ngIf="to.label">{{ to.label }}</legend>
      <p *ngIf="to.description">{{ to.description }}</p>

      <div
        class="alert alert-danger"
        role="alert"
        *ngIf="showError && formControl.errors"
      >
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>

      <ng-container *ngFor="let field of field.fieldGroup; let i = index">
        <div class="d-flex flex-row-reverse">
          <button class="btn btn-danger" type="button" (click)="remove(i)">
            -
          </button>
        </div>
        <div class="row">
          <formly-field class="col-sm-12" [field]="field"></formly-field>
        </div>
      </ng-container>

      <div class="d-flex flex-row-reverse">
        <button class="btn btn-primary" type="button" (click)="add()">
          Add {{ to.label }}
        </button>
      </div>
    </fieldset>
  `,
})
export class ArrayTypeComponent extends FieldArrayType {}
