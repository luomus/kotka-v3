import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { TransactionTypeLabelPipe } from '../transaction-type-label.pipe';
import { TransactionSheetContext } from '../transaction-pdf-sheets-context-service';
import { ComponentWithContext } from '@kotka/services';
import { PipesModule } from '@kotka/pipes';

@Component({
  standalone: true,
  imports: [CommonModule, SharedModule, PipesModule, TransactionTypeLabelPipe],
  selector: 'kotka-transaction-return-sheet',
  templateUrl: './transaction-return-sheet.html'
})
export class TransactionReturnSheetComponent implements ComponentWithContext {
  @Input({ required: true }) context!: TransactionSheetContext;

  get data(): SpecimenTransaction {
    return this.context.data;
  }

  get totalAwayCount(): number {
    return (this.data.awayIDs || []).length + (this.data.awayCount || 0);
  }
}
