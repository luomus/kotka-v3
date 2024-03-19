import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionSheetContext } from '../transaction-pdf-sheets-context-service';
import { PdfTemplateComponent } from '@kotka/services';
import { TransactionSheetHeaderComponent } from '../sheet-components/transaction-sheet-header/transaction-sheet-header';
import { TransactionSheetRemarksComponent } from '../sheet-components/transaction-sheet-remarks/transaction-sheet-remarks';
import {
  TransactionSheetIncomingDetailsComponent
} from '../sheet-components/transaction-sheet-incoming-details/transaction-sheet-incoming-details';
import {
  TransactionSheetSignatureAndMaterialComponent
} from '../sheet-components/transaction-sheet-signature-and-material/transaction-sheet-signature-and-material';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TransactionSheetHeaderComponent,
    TransactionSheetRemarksComponent,
    TransactionSheetIncomingDetailsComponent,
    TransactionSheetSignatureAndMaterialComponent
  ],
  selector: 'kotka-transaction-return-sheet',
  templateUrl: './transaction-return-sheet.html'
})
export class TransactionReturnSheetComponent implements PdfTemplateComponent {
  @Input({ required: true }) context!: TransactionSheetContext;

  get data(): SpecimenTransaction {
    return this.context.data;
  }
}
