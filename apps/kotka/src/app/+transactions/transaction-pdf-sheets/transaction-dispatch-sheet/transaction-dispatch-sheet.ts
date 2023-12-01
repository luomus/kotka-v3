import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { TransactionTypeLabelPipe } from '../transaction-type-label.pipe';
import { DispatchSheetContext } from '../transaction-pdf-sheets-context-service';
import { ComponentWithContext } from '../../../shared/services/pdf.service';

@Component({
  standalone: true,
  imports: [CommonModule, SharedModule, TransactionTypeLabelPipe],
  selector: 'kotka-transaction-dispatch-sheet',
  templateUrl: './transaction-dispatch-sheet.html'
})
export class TransactionDispatchSheetComponent implements ComponentWithContext {
  @Input() context?: DispatchSheetContext;

  get data(): SpecimenTransaction {
    return this.context!.data;
  }

  get fieldData(): Record<string, any> {
    return this.context!.fieldData;
  }

  get totalAwayCount(): number {
    return (this.data.awayIDs || []).length + (this.data.awayCount || 0);
  }
}
