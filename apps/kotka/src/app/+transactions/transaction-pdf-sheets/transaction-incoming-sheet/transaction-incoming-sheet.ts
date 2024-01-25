import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionTypeLabelPipe } from '../pipes/transaction-type-label.pipe';
import { TransactionSheetContext } from '../transaction-pdf-sheets-context-service';
import { ComponentWithContext } from '@kotka/services';
import { PipesModule } from '@kotka/pipes';
import { TransactionSheetHeaderComponent } from '../sheet-components/transaction-sheet-header/transaction-sheet-header';
import { TransactionSheetMaterialComponent } from '../sheet-components/transaction-sheet-material/transaction-sheet-material';
import { TransactionSheetRemarksComponent } from '../sheet-components/transaction-sheet-remarks/transaction-sheet-remarks';
import {
  TransactionSheetSignatureComponent
} from '../sheet-components/transaction-sheet-signature/transaction-sheet-signature';
import {
  TransactionSheetIncomingDetailsComponent
} from '../sheet-components/transaction-sheet-incoming-details/transaction-sheet-incoming-details';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    PipesModule,
    TransactionTypeLabelPipe,
    TransactionSheetHeaderComponent,
    TransactionSheetMaterialComponent,
    TransactionSheetRemarksComponent,
    TransactionSheetSignatureComponent,
    TransactionSheetIncomingDetailsComponent
  ],
  selector: 'kotka-transaction-incoming-sheet',
  templateUrl: './transaction-incoming-sheet.html'
})
export class TransactionIncomingSheetComponent implements ComponentWithContext {
  @Input({ required: true }) context!: TransactionSheetContext;

  get data(): SpecimenTransaction {
    return this.context.data;
  }
}
