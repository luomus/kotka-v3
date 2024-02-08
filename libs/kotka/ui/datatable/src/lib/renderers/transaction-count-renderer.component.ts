import { Component } from '@angular/core';
import { CellRendererComponent } from './cell-renderer';
import { ICellRendererParams } from '@ag-grid-community/core';
import { asSpecimenTransaction } from '@kotka/shared/models';

interface RendererParams extends ICellRendererParams {
  type: 'balance'|'total'|'returned'
}

@Component({
  selector: 'kui-transaction-count-renderer',
  template: `
    <span title="{{ result }}">{{ result }}</span>
  `,
  styles: []
})
export class TransactionCountRendererComponent extends CellRendererComponent<RendererParams> {
  result?: number;

  override paramsChange() {
    if (!this.params.data) {
      this.result = undefined;
      return;
    }

    const transaction = asSpecimenTransaction(this.params.data);
    const awayCount = (transaction.awayIDs || []).length + (transaction.awayCount || 0);
    const returnedCount = (transaction.returnedIDs || []).length + (transaction.returnedCount || 0);
    const missingCount = (transaction.missingIDs || []).length + (transaction.missingCount || 0);

    if (this.params.type === 'balance') {
      this.result = awayCount * -1;
    } else if (this.params.type === 'total') {
      this.result = awayCount + returnedCount + missingCount;
    } else {
      this.result = returnedCount;
    }
  }
}
