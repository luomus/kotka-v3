import {
  ChangeDetectionStrategy,
  Component, ContentChild,
  Input,
  TemplateRef,
} from '@angular/core';
import { DifferenceObject, KotkaDocumentObject, LajiForm } from '@kotka/shared/models';

interface Field {
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

  fields?: Field[];

  @ContentChild('labelTpl') labelTpl?: TemplateRef<any>;

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

  isMultiLangField(field: Field, data?: any, differenceData?: any): boolean {
    return field.type === 'text' && typeof data !== 'string' && typeof differenceData !== 'string';
  }

  getIndexRangeForArrayValue(value: Array<any>, differenceData: Array<any>): number[] {
    const arrayLength = Math.max(value?.length || 0, differenceData?.length || 0);
    return Array(arrayLength).fill(undefined).map((x, i) => i);
  }
}
