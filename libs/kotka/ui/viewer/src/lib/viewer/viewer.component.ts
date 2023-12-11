import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewEncapsulation, } from '@angular/core';
import { DifferenceObject, KotkaDocumentObject, LajiForm } from '@kotka/shared/models';

export interface Field {
  name: keyof KotkaDocumentObject;
  label: string;
  type: 'text'|'checkbox'|'select'|'collection'|string;
  options?: { value_options?: Record<string, string> },
  fields?: Field[]
}

@Component({
  selector: 'kui-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerComponent {
  @Input() set form(form: LajiForm.JsonForm|undefined) {
    if (form) {
      this.fields = [...this.metaFields, ...form.fields];
    } else {
      this.fields = undefined;
    }
  }
  @Input() data?: KotkaDocumentObject;
  @Input() differenceData: DifferenceObject = {};
  @Input() labelTpl?: TemplateRef<any>;

  fields?: Field[];

  private metaFields: Field[] = [{
    name: 'editor',
    label: 'Editor',
    type: 'text'
  }, {
    name: 'dateEdited',
    label: 'Date edited',
    type: 'text'
  }, {
    name: 'creator',
    label: 'Creator',
    type: 'text'
  }, {
    name: 'dateCreated',
    label: 'Date created',
    type: 'text'
  }];
}
