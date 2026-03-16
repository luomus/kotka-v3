import {
  ChangeDetectionStrategy,
  Component, computed, input, Signal
} from '@angular/core';
import {
  Patch, DifferenceObjectValue, isPatch,
  LajiForm, isPatchArray
} from '@kotka/shared/models';
import { ViewerFieldValueArrayComponent } from './viewer-field-value-array.component';
import { ViewerFieldValueComponent } from './viewer-field-value.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kui-viewer-field',
  template: `
    @if (hasData()) {
      <div class="row mb-1">
        <div class="col-sm-3">
          <label
          ><strong>{{ label() || field().label }}:</strong></label
          ><br />
        </div>
        <div
          class="col-sm-9"
          [ngClass]="{
            'viewer-field-removed': patch()?.op === 'remove',
            'viewer-field-added': patch()?.op === 'add',
          }"
        >
          @if (isArrayField()) {
            <kui-viewer-field-value-array
              [field]="field()"
              [data]="patch()?.op === 'add' ? patch()?.value : data()"
              [patches]="patches()"
            ></kui-viewer-field-value-array>
          } @else {
            <kui-viewer-field-value
              [field]="field()"
              [data]="data()"
              [patch]="patch()"
            ></kui-viewer-field-value>
          }
        </div>
      </div>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ViewerFieldValueArrayComponent,
    ViewerFieldValueComponent,
  ],
})
export class ViewerFieldComponent {
  label = input<string>();
  field = input.required<LajiForm.Field>();
  data = input<any>();
  differenceData = input<DifferenceObjectValue>();

  isArrayField: Signal<boolean> = computed(() => this.field()?.type === 'collection');

  patch: Signal<Patch | undefined> = computed(() => {
    const data = this.differenceData();
    return isPatch(data) ? data : undefined;
  });
  patches: Signal<Patch[] | undefined> = computed(() => {
    const data = this.differenceData();
    return isPatchArray(data) ? data : undefined;
  });

  hasData: Signal<boolean> = computed(() => {
    const hasData =
      this.data() != null &&
      this.data() !== '' &&
      (!this.isArrayField() || this.data().length > 0);

    const hasDiffData =
      this.differenceData() != null &&
      (!this.isArrayField() || this.patch()?.value?.length > 0);

    return hasData || hasDiffData;
  });
}
