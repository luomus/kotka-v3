import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { KotkaDocumentObjectType } from '@kotka/shared/models';

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
  dataType = KotkaDocumentObjectType.dataset;
}
