import {
  ChangeDetectionStrategy,
  Component,
  Input, TemplateRef,
} from '@angular/core';
import { Field } from '../viewer.component';
import { DifferenceObject, DifferenceObjectPatch, isDifferenceObjectPatch } from '@kotka/shared/models';

@Component({
  selector: 'kui-viewer-multilang',
  template: `
    <ng-container *ngIf="field">
      <ng-container *ngFor="let lang of ['en', 'fi', 'sv']">
        <ng-container *ngIf="data?.[lang] || differenceDataObject?.[lang] || differenceDataPatch?.value?.[lang]">
          <kui-viewer-field
            [label]="field.label + ' (' + lang + ')'"
            [field]="field"
            [data]="data?.[lang]"
            [differenceData]="differenceDataPatch ? { op: differenceDataPatch.op, value: differenceDataPatch.value[lang] } : $any(differenceDataObject?.[lang])"
            [labelTpl]="labelTpl"
          ></kui-viewer-field>
        </ng-container>
      </ng-container>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerMultilangComponent {
  @Input() field?: Field;
  @Input() data?: any;
  @Input() set differenceData(differenceData: DifferenceObject|DifferenceObjectPatch|undefined) {
    this.differenceDataObject = undefined;
    this.differenceDataPatch = undefined;

    if (isDifferenceObjectPatch(differenceData)) {
      this.differenceDataPatch = differenceData;
    } else {
      this.differenceDataObject = differenceData;
    }
  };
  @Input() labelTpl?: TemplateRef<any>;

  differenceDataObject?: DifferenceObject;
  differenceDataPatch?: DifferenceObjectPatch;
}
