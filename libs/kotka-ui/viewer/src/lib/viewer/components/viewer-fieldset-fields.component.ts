import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DifferenceObject, LajiForm } from '@kotka/shared/models';
import { ViewerFieldsetFieldComponent } from './viewer-fieldset-field.component';


@Component({
  selector: 'kui-viewer-fieldset-fields',
  template: `
    @for (field of fields(); track field) {
      <kui-viewer-fieldset-field
        [field]="field"
        [data]="data()?.[field.name || '']"
        [differenceData]="differenceData()?.[field.name || '']"
      ></kui-viewer-fieldset-field>
    }
    `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewerFieldsetFieldComponent],
})
export class ViewerFieldsetFieldsComponent {
  fields = input<LajiForm.Field[]>([]);
  data = input<any>();
  differenceData = input<DifferenceObject>();
}
