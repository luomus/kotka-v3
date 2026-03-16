import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  Signal,
} from '@angular/core';
import {
  isPatch,
  isPatchArray,
  LajiForm,
  DifferenceObjectValue,
  DifferenceObject,
  Patch,
} from '@kotka/shared/models';
import { CommonModule } from '@angular/common';
import { ViewerFieldsetFieldsComponent } from './viewer-fieldset-fields.component';
import {
  alignArrayWithPatchArray,
  alignPatchArrayWithArray,
} from '../../services/utils';

@Component({
  selector: 'kui-viewer-collection',
  template: `
    @if (alignedData().length || alignedPatches().length) {
      <div class="viewer-collection">
        @for (dataItem of alignedData(); track $index; let i = $index) {
          <div
            class="viewer-collection-item"
            [ngClass]="{
              'viewer-collection-removed':
                alignedPatches()[i]?.op === 'remove',
              'viewer-collection-added': alignedPatches()[i]?.op === 'add',
            }"
          >
            <h3 class="viewer-collection-item-title">
              {{ field().label }}
              @if (alignedData().length > 1) {
                <span class="viewer-collection-item-index">({{ i + 1 }}/{{ alignedData().length }})</span>
              }
            </h3>
            <kui-viewer-fieldset-fields
              [fields]="field().fields || []"
              [data]="
                alignedPatches()[i]?.op === 'add'
                  ? alignedPatches()[i]?.value
                  : dataItem
              "
              [differenceData]="differenceObjects()?.[i]"
            ></kui-viewer-fieldset-fields>
          </div>
        }
      </div>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, forwardRef(() => ViewerFieldsetFieldsComponent)],
})
export class ViewerCollectionComponent {
  field = input.required<LajiForm.Field>();
  data = input<any[]>();
  differenceData = input<DifferenceObjectValue>();

  patches = computed(() => {
    const data = this.differenceData();

    if (isPatch(data) && Array.isArray(data.value)) {
      return data.value.map((value) => ({ op: data.op, value }));
    } else if (isPatchArray(data)) {
      return data;
    }

    return undefined;
  });

  differenceObjects: Signal<DifferenceObject[] | undefined> = computed(() => {
    const data = this.differenceData();

    if (Array.isArray(data) && !isPatchArray(data)) {
      return data;
    }

    return undefined;
  });

  alignedData: Signal<any[]> = computed(() =>
    alignArrayWithPatchArray(this.data(), this.patches()),
  );
  alignedPatches: Signal<Patch[]> = computed(() =>
    alignPatchArrayWithArray(this.patches(), this.data()),
  );
}
