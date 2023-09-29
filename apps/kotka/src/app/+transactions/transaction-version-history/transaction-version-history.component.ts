import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { DataType } from '../../shared/services/api-services/data.service';

@Component({
  selector: 'kotka-transaction-version-history',
  template: `
    <kotka-version-history-view
      [formId]="'MHL.930'"
      [dataType]="dataType"
    ></kotka-version-history-view>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionVersionHistoryComponent {
  dataType = DataType.transaction;
}
