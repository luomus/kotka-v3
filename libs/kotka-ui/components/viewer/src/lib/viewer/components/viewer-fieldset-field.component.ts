import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  DifferenceObjectValue,
  isDifferenceObjectPatch,
  LajiForm,
} from '@kotka/shared/models';
import { ViewerCollectionComponent } from './viewer-collection.component';
import { ViewerMultilangComponent } from './viewer-multilang.component';
import { ViewerFieldComponent } from './viewer-field.component';


@Component({
  selector: 'kui-viewer-fieldset-field',
  template: `
    @if (field) {
      @if (
        field.type === 'collection' && field.fields) {
        <kui-viewer-collection
          [field]="field"
          [data]="data"
          [differenceData]="$any(differenceData)"
        ></kui-viewer-collection>
      } @else {
        @if (isMultiLangField(field)) {
          <kui-viewer-multilang
            [field]="field"
            [data]="data"
            [differenceData]="$any(differenceData)"
          ></kui-viewer-multilang>
        } @else {
          <kui-viewer-field
            [field]="field"
            [data]="data"
            [differenceData]="$any(differenceData)"
          ></kui-viewer-field>
        }
      }
    }
    `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ViewerCollectionComponent,
    ViewerMultilangComponent,
    ViewerFieldComponent
],
})
export class ViewerFieldsetFieldComponent {
  @Input() field?: LajiForm.Field;
  @Input() data?: any;
  @Input() differenceData?: DifferenceObjectValue;

  isMultiLangField(field: LajiForm.Field): boolean {
    const differenceValue = isDifferenceObjectPatch(this.differenceData)
      ? this.differenceData.value
      : undefined;

    return (
      field.type === 'text' &&
      (this.isNotString(this.data) || this.isNotString(differenceValue))
    );
  }

  private isNotString(value?: any): boolean {
    if (value === undefined || value === null) {
      return false;
    }
    return typeof value !== 'string';
  }
}
