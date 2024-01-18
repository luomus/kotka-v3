import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionSheetContext } from '../transaction-pdf-sheets-context-service';
import { ComponentWithContext } from '@kotka/services';
import { PipesModule } from '@kotka/pipes';
import { TransactionDispatchLabelPipe } from '../pipes/transaction-dispatch-label.pipe';
import { TransactionSheetHeaderComponent } from '../sheet-components/transaction-sheet-header/transaction-sheet-header';
import { TransactionSheetMaterialComponent } from '../sheet-components/transaction-sheet-material/transaction-sheet-material';
import { TransactionSheetSignatureComponent } from '../sheet-components/transaction-sheet-signature/transaction-sheet-signature';
import { TransactionSheetRemarksComponent } from '../sheet-components/transaction-sheet-remarks/transaction-sheet-remarks';
import {
  TransactionSheetOutgoingDetailsComponent
} from '../sheet-components/transaction-sheet-outgoing-details/transaction-sheet-outgoing-details';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    PipesModule,
    TransactionDispatchLabelPipe,
    TransactionSheetHeaderComponent,
    TransactionSheetMaterialComponent,
    TransactionSheetRemarksComponent,
    TransactionSheetSignatureComponent,
    TransactionSheetOutgoingDetailsComponent
  ],
  selector: 'kotka-transaction-dispatch-sheet',
  templateUrl: './transaction-dispatch-sheet.html'
})
export class TransactionDispatchSheetComponent implements ComponentWithContext {
  @Input({ required: true }) context!: TransactionSheetContext;

  get data(): SpecimenTransaction {
    return this.context!.data;
  }
}
