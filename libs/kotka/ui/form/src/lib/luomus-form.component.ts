import {
  ChangeDetectionStrategy,
  Component,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { FormlyFieldConfig, FormlyForm } from '@ngx-formly/core';

@Component({
  selector: 'luomus-form',
  template: `
    <ng-container>
      <form [formGroup]="form | toFormGroup" (ngSubmit)="onSubmit.emit(model)">
        <ng-content></ng-content>
      </form>
    </ng-container>
  `,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LuomusForm extends FormlyForm {
  @Input()
  isValid?: boolean;

  @Output()
  isValidChange = new EventEmitter<boolean>();

  @Input()
  set inputs(
    fields: { [key: string]: FormlyFieldConfig } | FormlyFieldConfig[]
  ) {
    super.fields = Array.isArray(fields) ? fields : Object.values(fields);
  }

  @Output()
  onSubmit = new EventEmitter();
}
