import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, } from '@angular/core';
import { DifferenceObject, KotkaDocumentObject, LajiForm } from '@kotka/shared/models';

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

  fields?: LajiForm.Field[];

  private metaFields: LajiForm.Field[] = [{
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
