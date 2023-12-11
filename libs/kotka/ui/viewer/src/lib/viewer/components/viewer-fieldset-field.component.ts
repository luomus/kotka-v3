import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
} from '@angular/core';
import { Field } from '../viewer.component';
import {
  DifferenceObjectValue,
  isDifferenceObjectPatch
} from '@kotka/shared/models';

@Component({
  selector: 'kui-viewer-fieldset-field',
  template: `
    <ng-container *ngIf="field">
      <kui-viewer-collection
        *ngIf="field.type === 'collection' && field.fields else nonCollectionField"
        [field]="field"
        [data]="data"
        [differenceData]="$any(differenceData)"
        [labelTpl]="labelTpl"
      ></kui-viewer-collection>

      <ng-template #nonCollectionField>
        <kui-viewer-multilang
          *ngIf="isMultiLangField(field) else basicField"
          [field]="field"
          [data]="data"
          [differenceData]="$any(differenceData)"
          [labelTpl]="labelTpl"
        ></kui-viewer-multilang>
      </ng-template>

      <ng-template #basicField>
        <kui-viewer-field
          [field]="field"
          [data]="data"
          [differenceData]="$any(differenceData)"
          [labelTpl]="labelTpl"
        ></kui-viewer-field>
      </ng-template>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerFieldsetFieldComponent {
  @Input() field?: Field;
  @Input() data?: any;
  @Input() differenceData?: DifferenceObjectValue;
  @Input() labelTpl?: TemplateRef<any>;

  isMultiLangField(field: Field): boolean {
    const differenceValue = isDifferenceObjectPatch(this.differenceData) ? this.differenceData.value : undefined;

    return field.type === 'text' && (this.isMultiLangValue(this.data) || this.isMultiLangValue(differenceValue));
  }

  private isMultiLangValue(value?: any): boolean {
    if (value === undefined || value === null) {
      return false;
    }
    return typeof value !== 'string';
  }
}
