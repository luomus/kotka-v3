import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  DifferenceObjectValue,
  isMultiLanguageObject,
  isPatch,
  LajiForm,
} from '@kotka/shared/models';
import { ViewerCollectionComponent } from './viewer-collection.component';
import { ViewerMultilangComponent } from './viewer-multilang.component';
import { ViewerFieldComponent } from './viewer-field.component';
import { ViewerFieldsetComponent } from './viewer-fieldset.component';


@Component({
  selector: 'kui-viewer-fieldset-field',
  template: `
    @if (field().type === 'collection' && field().fields) {
      <kui-viewer-collection
        [field]="field()"
        [data]="data()"
        [differenceData]="differenceData()"
      ></kui-viewer-collection>
    } @else if (field().type === 'fieldset') {
      <kui-viewer-fieldset
        [field]="field()"
        [data]="data()"
        [differenceData]="differenceData()"
      ></kui-viewer-fieldset>
    } @else if (isMultiLangField()) {
      <kui-viewer-multilang
        [field]="field()"
        [data]="data()"
        [differenceData]="differenceData()"
      ></kui-viewer-multilang>
    } @else {
      <kui-viewer-field
        [field]="field()"
        [data]="data()"
        [differenceData]="differenceData()"
      ></kui-viewer-field>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ViewerCollectionComponent,
    ViewerMultilangComponent,
    ViewerFieldsetComponent,
    ViewerFieldComponent,
  ],
})
export class ViewerFieldsetFieldComponent {
  field = input.required<LajiForm.Field>();
  data = input<any>();
  differenceData = input<DifferenceObjectValue>();

  isMultiLangField = computed(() => {
    const differenceData = this.differenceData();
    const differenceValue = isPatch(differenceData)
      ? differenceData.value
      : undefined;

    return (
      this.field().type === 'text' &&
      (isMultiLanguageObject(this.data()) || isMultiLanguageObject(differenceValue))
    );
  });
}
