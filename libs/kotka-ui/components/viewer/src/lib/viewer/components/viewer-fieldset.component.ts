import {
  ChangeDetectionStrategy,
  Component,
  computed, forwardRef,
  input,
  Signal,
} from '@angular/core';
import {
  Patch,
  DifferenceObjectValue,
  isPatch,
  LajiForm,
  DifferenceObject,
} from '@kotka/shared/models';
import { CommonModule } from '@angular/common';
import { ViewerFieldsetFieldsComponent } from './viewer-fieldset-fields.component';


@Component({
  selector: 'kui-viewer-fieldset',
  template: `
    @if (hasData()) {
      <div
        class="my-3"
        [ngClass]="{
          'viewer-fieldset-removed': patch()?.op === 'remove',
          'viewer-fieldset-added': patch()?.op === 'add',
        }"
      >
        <h4 class="border-bottom">{{ field().label }}</h4>
        <kui-viewer-fieldset-fields
          [fields]="field().fields || []"
          [data]="patch()?.op === 'add' ? patch()?.value : data()"
          [differenceData]="differenceObject()"
        ></kui-viewer-fieldset-fields>
      </div>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, forwardRef(() => ViewerFieldsetFieldsComponent)],
})
export class ViewerFieldsetComponent {
  field = input.required<LajiForm.Field>();
  data = input<any>();
  differenceData = input<DifferenceObjectValue>();

  patch: Signal<Patch | undefined> = computed(() => {
    const data = this.differenceData();
    return isPatch(data) ? data : undefined;
  });
  differenceObject: Signal<DifferenceObject | undefined> = computed(() => {
    const data = this.differenceData();
    return Array.isArray(data) || isPatch(data) ? undefined : data;
  });

  hasData = computed(() => {
    const hasData = Object.keys(this.data() || {}).length > 0;
    const hasDiffData = Object.keys(this.patch()?.value || {}).length > 0;
    return hasData || hasDiffData;
  });
}
