import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DifferenceObject, LajiForm } from '@kotka/shared/models';
import { ViewerFieldsetFieldComponent } from './viewer-fieldset-field.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kui-viewer-fieldset',
  template: `
    <ng-container *ngFor="let field of fields">
      <kui-viewer-fieldset-field
        [field]="field"
        [data]="data[field.name || '']"
        [differenceData]="differenceData?.[field.name || '']"
      ></kui-viewer-fieldset-field>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ViewerFieldsetFieldComponent],
})
export class ViewerFieldsetComponent {
  @Input() fields: LajiForm.Field[] = [];
  @Input() data: any = {};
  @Input() differenceData?: DifferenceObject;
}
