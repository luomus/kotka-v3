import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DifferenceObjectPatch, LajiForm } from '@kotka/shared/models';

@Component({
  selector: 'kui-viewer-field-value',
  template: `
    <ng-container *ngIf="field">
      <span
        *ngIf="data !== undefined && data !== null"
        class="viewer-field-value"
        [ngClass]="{
          'viewer-field-value-removed':
            differenceData?.op === 'remove' || differenceData?.op === 'replace'
        }"
      >
        <ng-container
          *ngTemplateOutlet="fieldValue; context: { value: data }"
        ></ng-container>
      </span>
      <span
        *ngIf="
          differenceData?.value !== undefined && differenceData?.value !== null
        "
        class="viewer-field-value"
        [ngClass]="{
          'viewer-field-value-added':
            differenceData?.op === 'add' || differenceData?.op === 'replace'
        }"
      >
        <ng-container
          *ngTemplateOutlet="
            fieldValue;
            context: { value: differenceData?.value }
          "
        ></ng-container>
      </span>

      <ng-template #fieldValue let-value="value">
        <ng-container *ngIf="field.type === 'select'; else defaultFieldValue">
          {{ $any(value) | enum: field }}
        </ng-container>
        <ng-template #defaultFieldValue>
          {{ value | label }}
        </ng-template>
      </ng-template>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerFieldValueComponent {
  @Input() field?: LajiForm.Field;
  @Input() data?: any;
  @Input() differenceData?: DifferenceObjectPatch;
}
