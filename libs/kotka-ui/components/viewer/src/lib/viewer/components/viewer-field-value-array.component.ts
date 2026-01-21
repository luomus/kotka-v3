import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Patch, LajiForm } from '@kotka/shared/models';
import { ViewerFieldValueComponent } from './viewer-field-value.component';
import {
  alignArrayWithPatchArray,
  alignPatchArrayWithArray,
} from '../../services/utils';

@Component({
  selector: 'kui-viewer-field-value-array',
  template: `
    <div class="array-field">
      @for (dataItem of alignedData(); track $index; let i = $index; let last = $last) {
        <kui-viewer-field-value
          [field]="field()"
          [data]="dataItem"
          [patch]="alignedPatches()[i]"
        ></kui-viewer-field-value>
        @if (!last) {
          <span>, </span>
        }
      }
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewerFieldValueComponent],
})
export class ViewerFieldValueArrayComponent {
  field = input.required<LajiForm.Field>();
  data = input<any[]>();
  patches = input<Patch[]>();

  alignedData = computed(() => alignArrayWithPatchArray(this.data(), this.patches()));
  alignedPatches = computed(() => alignPatchArrayWithArray(this.patches(), this.data()));
}
