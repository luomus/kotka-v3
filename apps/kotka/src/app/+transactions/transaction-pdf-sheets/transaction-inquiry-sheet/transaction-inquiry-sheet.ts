import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { TransactionSheetContext } from '../transaction-pdf-sheets-context-service';
import { ComponentWithContext } from '@kotka/services';
import { PipesModule } from '@kotka/pipes';

@Component({
  standalone: true,
  imports: [CommonModule, SharedModule, PipesModule],
  selector: 'kotka-transaction-inquiry-sheet',
  templateUrl: './transaction-inquiry-sheet.html'
})
export class TransactionInquirySheetComponent implements ComponentWithContext {
  @Input({ required: true }) context!: TransactionSheetContext;

  get data(): SpecimenTransaction {
    return this.context.data;
  }

  get fieldData(): Record<string, any> {
    return this.context.fieldData;
  }

  get totalAwayCount(): number {
    return (this.data.awayIDs || []).length + (this.data.awayCount || 0);
  }
}
