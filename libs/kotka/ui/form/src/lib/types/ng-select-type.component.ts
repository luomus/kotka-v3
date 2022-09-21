import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-array-type',
  template: `
    <ng-container *ngIf="this.to.options | toObservable | async as options">
      <ng-select
        *ngIf="to.options"
        class="form-control"
        [multiple]="to.multiple"
        [items]="options"
        [placeholder]="'Select'"
        [bindValue]="'value'"
        [formControl]="$any(formControl)"
        [class.is-invalid]="showError"
      ></ng-select>
    </ng-container>
  `,
})
export class NgSelectTypeComponent extends FieldType {}
