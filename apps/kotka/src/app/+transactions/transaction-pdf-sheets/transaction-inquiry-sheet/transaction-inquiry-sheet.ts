import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionSheetContext } from '../transaction-pdf-sheets-context-service';
import { ComponentWithContext } from '@kotka/services';
import { PipesModule } from '@kotka/pipes';
import { TransactionSheetHeaderComponent } from '../sheet-components/transaction-sheet-header/transaction-sheet-header';
import { TransactionSheetMaterialComponent } from '../sheet-components/transaction-sheet-material/transaction-sheet-material';
import { TransactionSheetRemarksComponent } from '../sheet-components/transaction-sheet-remarks/transaction-sheet-remarks';
import {
  TransactionSheetOutgoingDetailsComponent
} from '../sheet-components/transaction-sheet-outgoing-details/transaction-sheet-outgoing-details';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    PipesModule,
    TransactionSheetHeaderComponent,
    TransactionSheetMaterialComponent,
    TransactionSheetRemarksComponent,
    TransactionSheetOutgoingDetailsComponent
  ],
  selector: 'kotka-transaction-inquiry-sheet',
  templateUrl: './transaction-inquiry-sheet.html'
})
export class TransactionInquirySheetComponent implements ComponentWithContext {
  @Input({ required: true }) context!: TransactionSheetContext;

  get data(): SpecimenTransaction {
    return this.context.data;
  }
}
