import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { KotkaObjectType } from '@kotka/api-interfaces';

@Component({
  selector: 'kotka-transaction-version-history',
  template: `
    <kotka-version-history-view
      [formId]="'MHL.731'"
      [dataType]="dataType"
      [dataTypeName]="'tag'"
    ></kotka-version-history-view>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetVersionHistoryComponent {
  dataType = KotkaObjectType.dataset;
}
