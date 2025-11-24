import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DifferenceObjectPatch, LajiForm } from '@kotka/shared/models';
import { ViewerFieldValueComponent } from './viewer-field-value.component';

import { ArrayIndexRangePipe } from '../../pipes/array-index-range.pipe';

@Component({
  selector: 'kui-viewer-field-value-array',
  template: `
    @if (field) {
      <div class="array-field">
        @for (i of data | arrayIndexRange: differenceData; track i; let last = $last) {
          <kui-viewer-field-value
            [field]="field"
            [data]="data?.[i]"
            [differenceData]="differenceData?.[i]"
          ></kui-viewer-field-value>
          @if (!last) {
            <span>, </span>
          }
        }
      </div>
    }
    `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewerFieldValueComponent, ArrayIndexRangePipe],
})
export class ViewerFieldValueArrayComponent {
  @Input() field?: LajiForm.Field;
  @Input() data?: any[];
  @Input() differenceData?: DifferenceObjectPatch[];
}
