import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
} from '@angular/core';
import { Field } from '../viewer.component';
import { DifferenceObject } from '@kotka/shared/models';

@Component({
  selector: 'kui-viewer-fieldset',
  template: `
    <ng-container *ngFor="let field of fields">
      <kui-viewer-fieldset-field
        [field]="field"
        [data]="data[field.name || '']"
        [differenceData]="differenceData?.[field.name || '']"
        [labelTpl]="labelTpl"
      ></kui-viewer-fieldset-field>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerFieldsetComponent {
  @Input() fields: Field[] = [];
  @Input() data: any = {};
  @Input() differenceData?: DifferenceObject;
  @Input() labelTpl?: TemplateRef<any>;
}
