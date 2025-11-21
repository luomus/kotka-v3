import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DifferenceObject, LajiForm } from '@kotka/shared/models';
import { ViewerFieldsetFieldComponent } from './viewer-fieldset-field.component';


@Component({
  selector: 'kui-viewer-fieldset',
  template: `
    @for (field of fields; track field) {
      <kui-viewer-fieldset-field
        [field]="field"
        [data]="data[field.name || '']"
        [differenceData]="differenceData?.[field.name || '']"
      ></kui-viewer-fieldset-field>
    }
    `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewerFieldsetFieldComponent],
})
export class ViewerFieldsetComponent {
  @Input() fields: LajiForm.Field[] = [];
  @Input() data: any = {};
  @Input() differenceData?: DifferenceObject;
}
