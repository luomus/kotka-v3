import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Patch, LajiForm } from '@kotka/shared/models';
import { CommonModule } from '@angular/common';
import { EnumPipe } from '@kotka/ui/pipes';
import { LabelValueComponent } from './label-value.component';

@Component({
  selector: 'kui-viewer-field-value',
  template: `
    @if (field(); as field) {
      @if (data() !== undefined && data() !== null) {
        <span
          class="viewer-field-value"
          [ngClass]="{ 'viewer-field-value-removed': patch()?.op === 'remove' || patch()?.op === 'replace' }"
          >
          <ng-container
            *ngTemplateOutlet="fieldValue; context: { value: data() }"
          ></ng-container>
        </span>
      }
      @if (patch()?.value !== undefined && patch()?.value !== null) {
        <span
          class="viewer-field-value"
          [ngClass]="{ 'viewer-field-value-added': patch()?.op === 'add' || patch()?.op === 'replace' }"
          >
          <ng-container
            *ngTemplateOutlet="fieldValue; context: { value: patch()?.value }"
          ></ng-container>
        </span>
      }
      <ng-template #fieldValue let-value="value">
        @if (field.options?.value_options) {
          @if (typeof value === 'string') {
            <span>{{ value | enum: field }}</span>
          }
        } @else {
          <kui-label-value [value]="value"></kui-label-value>
        }
      </ng-template>
    }
    `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EnumPipe, LabelValueComponent],
})
export class ViewerFieldValueComponent {
  field = input<LajiForm.Field>();
  data = input<any>();
  patch = input<Patch>();
}
