import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellRendererComponent } from './cell-renderer';
import { ICellRendererParams } from '@ag-grid-community/core';
import { SpecimenTransaction } from '@luomus/laji-schema';

type TransactionCountType = 'balance'|'total'|'returned';

interface RendererExtraParams {
  type: TransactionCountType
}

type RendererParams = ICellRendererParams & RendererExtraParams;

@Component({
  selector: 'kui-transaction-count-renderer',
  template: `
    <span title="{{ result }}">{{ result }}</span>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionCountRendererComponent extends CellRendererComponent<RendererParams> {
  result?: number;

  override paramsChange() {
    if (!this.params.data) {
      this.result = undefined;
      return;
    }

    const transaction: SpecimenTransaction = this.params.data;
    this.result = TransactionCountRendererComponent.getTransactionCount(transaction, this.params.type);
  }

  static getTransactionCount(transaction: SpecimenTransaction, countType: TransactionCountType) {
    const awayCount = (transaction.awayIDs || []).length + (transaction.awayCount || 0);
    const returnedCount = (transaction.returnedIDs || []).length + (transaction.returnedCount || 0);
    const missingCount = (transaction.missingIDs || []).length + (transaction.missingCount || 0);

    if (countType === 'balance') {
      return awayCount * -1;
    } else if (countType === 'total') {
      return  awayCount + returnedCount + missingCount;
    } else {
      return returnedCount;
    }
  }

  static override getExportValue(value: undefined, row: SpecimenTransaction, params: RendererExtraParams): string {
    return '' + TransactionCountRendererComponent.getTransactionCount(row, params.type);
  }
}
