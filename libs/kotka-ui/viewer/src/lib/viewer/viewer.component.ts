import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  effect,
  input,
} from '@angular/core';
import {
  DifferenceObject,
  KotkaDocumentObject,
  LajiForm,
} from '@kotka/shared/models';
import { ViewerFieldsetFieldsComponent } from './components/viewer-fieldset-fields.component';


@Component({
  selector: 'kui-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewerFieldsetFieldsComponent],
})
export class ViewerComponent {
  form = input<LajiForm.JsonForm | undefined>();
  data = input<KotkaDocumentObject | undefined>();
  differenceData = input<DifferenceObject>();
  ignoreFields = input<string[]>([]);

  fields?: LajiForm.Field[];

  private metaFields: LajiForm.Field[] = [
    {
      name: 'editor',
      label: 'Editor',
      type: 'text',
    },
    {
      name: 'dateEdited',
      label: 'Date edited',
      type: 'text',
    },
    {
      name: 'creator',
      label: 'Creator',
      type: 'text',
    },
    {
      name: 'dateCreated',
      label: 'Date created',
      type: 'text',
    },
  ];

  constructor() {
    effect(() => {
      const formValue = this.form();
      if (formValue) {
        this.fields = [...this.metaFields, ...formValue.fields].filter(field => !this.ignoreFields().includes(field.name));
      } else {
        this.fields = undefined;
      }
    });
  }
}
