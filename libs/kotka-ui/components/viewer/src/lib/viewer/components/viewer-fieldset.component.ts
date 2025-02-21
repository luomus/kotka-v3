import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DifferenceObject, LajiForm } from '@kotka/shared/models';

@Component({
  selector: 'kui-viewer-fieldset',
  template: `
    <ng-container *ngFor="let field of fields">
      <kui-viewer-fieldset-field
        [field]="field"
        [data]="data[field.name || '']"
        [differenceData]="differenceData?.[field.name || '']"
      ></kui-viewer-fieldset-field>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerFieldsetComponent {
  @Input() fields: LajiForm.Field[] = [];
  @Input() data: any = {};
  @Input() differenceData?: DifferenceObject;
}
