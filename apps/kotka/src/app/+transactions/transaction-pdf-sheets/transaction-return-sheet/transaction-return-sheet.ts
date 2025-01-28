import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionSheetContext } from '../services/transaction-pdf-sheets-context-service';
import { PdfTemplateComponent } from '@kotka/services';
import { TransactionSheetHeaderComponent } from '../sheet-components/transaction-sheet-header/transaction-sheet-header';
import { TransactionSheetRemarksComponent } from '../sheet-components/transaction-sheet-remarks/transaction-sheet-remarks';
import {
  TransactionSheetIncomingReturnDetailsComponent
} from '../sheet-components/transaction-sheet-incoming-return-details/transaction-sheet-incoming-return-details';
import {
  TransactionSheetSignatureAndMaterialComponent
} from '../sheet-components/transaction-sheet-signature-and-material/transaction-sheet-signature-and-material';
import { TransactionTypeLabelPipe } from '../pipes/transaction-type-label.pipe';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TransactionSheetHeaderComponent,
    TransactionSheetRemarksComponent,
    TransactionSheetIncomingReturnDetailsComponent,
    TransactionSheetSignatureAndMaterialComponent,
    TransactionTypeLabelPipe
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
