import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import {
  DifferenceObjectPatch,
  isDifferenceObjectPatch,
  LajiForm,
} from '@kotka/shared/models';

@Component({
  selector: 'kui-viewer-field',
  template: `
    <div class="row mb-1" *ngIf="field && hasData">
      <div class="col-sm-3">
        <label
          ><strong>{{ label || field.label }}:</strong></label
        ><br />
      </div>
      <div class="col-sm-9">
        <div
          *ngIf="isArray"
          [ngClass]="{
            'viewer-array-field-removed': differenceDataPatch?.op === 'remove',
            'viewer-array-field-added': differenceDataPatch?.op === 'add'
          }"
        >
          <kui-viewer-field-value-array
            [field]="field"
            [data]="
              differenceDataPatch?.op === 'add'
                ? differenceDataPatch?.value
                : data
            "
            [differenceData]="differenceDataPatchArray"
          ></kui-viewer-field-value-array>
        </div>
        <kui-viewer-field-value
          *ngIf="!isArray"
          [field]="field"
          [data]="data"
          [differenceData]="differenceDataPatch"
        ></kui-viewer-field-value>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerFieldComponent implements OnChanges {
  @Input() label?: string;
  @Input() field?: LajiForm.Field;
  @Input() data?: any;
  @Input() differenceData?: DifferenceObjectPatch | DifferenceObjectPatch[];

  isArray = false;
  hasData = false;

  differenceDataPatch?: DifferenceObjectPatch;
  differenceDataPatchArray?: DifferenceObjectPatch[];

  ngOnChanges() {
    this.isArray = this.field?.type === 'collection';

    if (isDifferenceObjectPatch(this.differenceData)) {
      this.differenceDataPatch = this.differenceData;
      this.differenceDataPatchArray = undefined;
    } else {
      this.differenceDataPatch = undefined;
      this.differenceDataPatchArray = this.differenceData;
    }

    const hasData =
      this.data != null &&
      this.data !== '' &&
      (!this.isArray || this.data?.length > 0);
    const hasDiffData =
      this.differenceData != null &&
      (!this.isArray ||
        !['add', 'remove'].includes(this.differenceDataPatch?.op || '') ||
        this.differenceDataPatch?.value?.length > 0);

    this.hasData = hasData || hasDiffData;
  }
}
