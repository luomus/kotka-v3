import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { LajiForm, StoreObject } from '@kotka/shared/models';
import { DataObject, DifferenceObject } from '../../../shared/services/api-services/data.service';

interface Field {
  name: keyof DataObject;
  label: string;
  type: 'text'|'checkbox'|'select'|'collection'|string;
  options?: { value_options?: Record<string, string> },
  fields?: Field[]
}

@Component({
  selector: 'kotka-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerComponent {
  @Input() set form(form: LajiForm.JsonForm|undefined) {
    if (form) {
      this.fields = [...this.metaFields, ...form.fields];
    } else {
      this.fields = undefined;
    }
  };
  @Input() data?: StoreObject;
  @Input() differenceData: DifferenceObject = {};

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

  getIndexRangeForArrayValue(value: Array<any>, differenceData: Array<any>): number[] {
    const arrayLength = Math.max(value?.length || 0, differenceData?.length || 0);
    return Array(arrayLength).fill(undefined).map((x, i) => i);
  }
}
