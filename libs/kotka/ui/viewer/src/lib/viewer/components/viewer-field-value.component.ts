import {
  ChangeDetectionStrategy,
  Component,
  Input, TemplateRef,
} from '@angular/core';
import { Field } from '../viewer.component';
import { DifferenceObjectPatch } from '@kotka/shared/models';

@Component({
  selector: 'kui-viewer-field-value',
  template: `
    <ng-container *ngIf="field">
      <span
        *ngIf="data !== undefined && data !== null"
        class="viewer-field-value"
        [ngClass]="{'viewer-field-value-removed': differenceData?.op === 'remove' || differenceData?.op === 'replace' }"
      >
        <ng-container *ngTemplateOutlet="fieldValue; context: { value: data }"></ng-container>
      </span>
      <span
        *ngIf="differenceData?.value !== undefined && differenceData?.value !== null"
        class="viewer-field-value"
        [ngClass]="{'viewer-field-value-added': differenceData?.op === 'add' || differenceData?.op === 'replace' }"
      >
        <ng-container *ngTemplateOutlet="fieldValue; context: { value: differenceData?.value }"></ng-container>
      </span>

      <ng-template #fieldValue let-value="value">
        <ng-container *ngIf="field.type === 'select' else defaultFieldValue">
          {{ $any(value) | enum: field }}
        </ng-container>
        <ng-template #defaultFieldValue>
          <ng-container *ngTemplateOutlet="labelTpl ? labelTpl : noLabel; context: { value }"></ng-container>
        </ng-template>
      </ng-template>

      <ng-template #noLabel let-value="value">
        {{ value }}
      </ng-template>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerFieldValueComponent {
  @Input() field?: Field;
  @Input() data?: any;
  @Input() differenceData?: DifferenceObjectPatch;
  @Input() labelTpl?: TemplateRef<any>;
}
