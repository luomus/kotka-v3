import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionTypeLabelPipe } from '../pipes/transaction-type-label.pipe';
import { TransactionSheetContext } from '../transaction-pdf-sheets-context-service';
import { PdfTemplateComponent } from '@kotka/services';
import { PipesModule } from '@kotka/pipes';
import { TransactionSheetHeaderComponent } from '../sheet-components/transaction-sheet-header/transaction-sheet-header';
import { TransactionSheetRemarksComponent } from '../sheet-components/transaction-sheet-remarks/transaction-sheet-remarks';
import {
  TransactionSheetIncomingDetailsComponent
} from '../sheet-components/transaction-sheet-incoming-details/transaction-sheet-incoming-details';
import {
  TransactionSheetSignatureAndMaterialComponent
} from '../sheet-components/transaction-sheet-signature-and-material/transaction-sheet-signature-and-material';
import { TransactionUtils } from '../services/transaction-utils';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    PipesModule,
    TransactionTypeLabelPipe,
    TransactionSheetHeaderComponent,
    TransactionSheetRemarksComponent,
    TransactionSheetIncomingDetailsComponent,
    TransactionSheetSignatureAndMaterialComponent
  ],
  selector: 'kotka-transaction-incoming-sheet',
  templateUrl: './transaction-incoming-sheet.html'
})
export class TransactionIncomingSheetComponent implements PdfTemplateComponent {
  @Input({ required: true }) context!: TransactionSheetContext;

  get data(): SpecimenTransaction {
    return this.context.data;
  }

  isGiftOrExchange(): boolean {
    return TransactionUtils.isGiftOrExchange(this.context.data);
  }
}
