import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import {
  DifferenceObject,
  DifferenceObjectPatch,
  isDifferenceObjectPatch,
  LajiForm,
} from '@kotka/shared/models';
import { CommonModule } from '@angular/common';
import { ViewerFieldsetComponent } from './viewer-fieldset.component';
import { ArrayIndexRangePipe } from '../../pipes/array-index-range.pipe';

@Component({
  selector: 'kui-viewer-collection',
  template: `
    <div
      class="row mt-3 mb-1"
      *ngIf="field && (data?.length || differenceDataPatchArray?.length)"
    >
      <div class="col-12">
        <h2>{{ field.label }}</h2>
        <div
          class="card card-body bg-light mb-2"
          [ngClass]="{
            'viewer-fieldset-removed':
              differenceDataPatchArray?.[i]?.op === 'remove',
            'viewer-fieldset-added':
              differenceDataPatchArray?.[i]?.op === 'add',
          }"
          *ngFor="let i of data | arrayIndexRange: differenceDataPatchArray"
        >
          <kui-viewer-fieldset
            [fields]="field.fields || []"
            [data]="
              differenceDataPatchArray?.[i]?.op === 'add'
                ? differenceDataPatchArray?.[i]?.value
                : data?.[i]
            "
            [differenceData]="differenceDataObjectArray?.[i]"
          ></kui-viewer-fieldset>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, forwardRef(() => ViewerFieldsetComponent), ArrayIndexRangePipe],
})
export class ViewerCollectionComponent {
  @Input() field?: LajiForm.Field;
  @Input() data?: any[];
  @Input() set differenceData(
    differenceData:
      | DifferenceObject[]
      | DifferenceObjectPatch
      | DifferenceObjectPatch[]
      | undefined,
  ) {
    this.differenceDataObjectArray = undefined;
    this.differenceDataPatchArray = undefined;

    if (isDifferenceObjectPatch(differenceData)) {
      this.differenceDataPatchArray = (differenceData.value as any[]).map(
        (value) => ({
          op: differenceData.op,
          value,
        }),
      );
    } else if (Array.isArray(differenceData)) {
      if (isDifferenceObjectPatch(differenceData[0])) {
        this.differenceDataPatchArray =
          differenceData as DifferenceObjectPatch[];
      } else {
        this.differenceDataObjectArray = differenceData as DifferenceObject[];
      }
    }
  }

  differenceDataObjectArray?: DifferenceObject[];
  differenceDataPatchArray?: DifferenceObjectPatch[];
}
