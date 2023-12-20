import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';
import { DifferenceObjectPatch, LajiForm } from '@kotka/shared/models';

@Component({
  selector: 'kui-viewer-field-value-array',
  template: `
    <div *ngIf="field" class="array-field">
      <ng-container *ngFor="let i of (data | arrayIndexRange: differenceData); last as last">
        <kui-viewer-field-value
          [field]="field"
          [data]="data?.[i]"
          [differenceData]="differenceData?.[i]"
        ></kui-viewer-field-value>
        <span *ngIf="!last">, </span>
      </ng-container>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerFieldValueArrayComponent {
  @Input() field?: LajiForm.Field;
  @Input() data?: any[];
  @Input() differenceData?: DifferenceObjectPatch[];
}
