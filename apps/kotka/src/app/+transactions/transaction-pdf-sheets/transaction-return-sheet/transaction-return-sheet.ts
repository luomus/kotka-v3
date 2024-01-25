import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionSheetContext } from '../transaction-pdf-sheets-context-service';
import { ComponentWithContext } from '@kotka/services';
import { TransactionSheetHeaderComponent } from '../sheet-components/transaction-sheet-header/transaction-sheet-header';
import { TransactionSheetMaterialComponent } from '../sheet-components/transaction-sheet-material/transaction-sheet-material';
import { TransactionSheetRemarksComponent } from '../sheet-components/transaction-sheet-remarks/transaction-sheet-remarks';
import { TransactionSheetSignatureComponent } from '../sheet-components/transaction-sheet-signature/transaction-sheet-signature';
import {
  TransactionSheetIncomingDetailsComponent
} from '../sheet-components/transaction-sheet-incoming-details/transaction-sheet-incoming-details';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TransactionSheetHeaderComponent,
    TransactionSheetMaterialComponent,
    TransactionSheetRemarksComponent,
    TransactionSheetRemarksComponent,
    TransactionSheetSignatureComponent,
    TransactionSheetIncomingDetailsComponent
  ],
  selector: 'kotka-transaction-return-sheet',
  templateUrl: './transaction-return-sheet.html'
})
export class TransactionReturnSheetComponent implements ComponentWithContext {
  @Input({ required: true }) context!: TransactionSheetContext;

  get data(): SpecimenTransaction {
    return this.context.data;
  }
}
