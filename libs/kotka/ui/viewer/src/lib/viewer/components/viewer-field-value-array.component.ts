import {
  ChangeDetectionStrategy,
  Component,
  Input, TemplateRef,
} from '@angular/core';
import { Field } from '../viewer.component';
import { DifferenceObjectPatch } from '@kotka/shared/models';

@Component({
  selector: 'kui-viewer-field-value-array',
  template: `
    <div *ngIf="field" class="array-field">
      <ng-container *ngFor="let i of (data | arrayIndexRange: differenceData); last as last">
        <kui-viewer-field-value
          [field]="field"
          [data]="data?.[i]"
          [differenceData]="differenceData?.[i]"
          [labelTpl]="labelTpl"
        ></kui-viewer-field-value>
        <span *ngIf="!last">, </span>
      </ng-container>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerFieldValueArrayComponent {
  @Input() field?: Field;
  @Input() data?: any[];
  @Input() differenceData?: DifferenceObjectPatch[];
  @Input() labelTpl?: TemplateRef<any>;
}
