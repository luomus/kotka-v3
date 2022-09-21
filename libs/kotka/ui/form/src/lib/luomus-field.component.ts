import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { FormlyField } from '@ngx-formly/core';

@Component({
  selector: 'luomus-field',
  template: `<ng-template #container></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LuomusFieldComponent
  extends FormlyField
  implements AfterViewInit {}
