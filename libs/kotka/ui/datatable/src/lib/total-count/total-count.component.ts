import { Component, Input } from '@angular/core';

@Component({
  selector: 'kui-total-count',
  template: `
    <span *ngIf="value !== undefined">
      <span data-cy="total-count">{{ value }}</span>
      <span [ngPlural]="value">
        <ng-template ngPluralCase="=1"> {{ dataTypeName }}</ng-template>
        <ng-template ngPluralCase="other"> {{ dataTypeNamePlural ? dataTypeNamePlural : dataTypeName + 's' }}</ng-template>
      </span>
      <span> found</span>
    </span>
  `
})
export class TotalCountComponent {
  @Input() value?: number;
  @Input({ required: true }) dataTypeName!: string;
  @Input() dataTypeNamePlural?: string;
}
