import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionSheetContext } from '../transaction-pdf-sheets-context-service';
import { PdfTemplateComponent } from '@kotka/services';
import { PipesModule } from '@kotka/pipes';
import { TransactionDispatchLabelPipe } from '../pipes/transaction-dispatch-label.pipe';
import { TransactionSheetHeaderComponent } from '../sheet-components/transaction-sheet-header/transaction-sheet-header';
import { TransactionSheetRemarksComponent } from '../sheet-components/transaction-sheet-remarks/transaction-sheet-remarks';
import {
  TransactionSheetOutgoingDetailsComponent
} from '../sheet-components/transaction-sheet-outgoing-details/transaction-sheet-outgoing-details';
import {
    TransactionSheetSignatureAndMaterialComponent
} from '../sheet-components/transaction-sheet-signature-and-material/transaction-sheet-signature-and-material';

@Component({
  standalone: true,
    imports: [
      CommonModule,
      PipesModule,
      TransactionDispatchLabelPipe,
      TransactionSheetHeaderComponent,
      TransactionSheetRemarksComponent,
      TransactionSheetOutgoingDetailsComponent,
      TransactionSheetSignatureAndMaterialComponent
    ],
  selector: 'kotka-transaction-dispatch-sheet',
  templateUrl: './transaction-dispatch-sheet.html'
})
export class TransactionDispatchSheetComponent implements PdfTemplateComponent {
  @Input({ required: true }) context!: TransactionSheetContext;

  get data(): SpecimenTransaction {
    return this.context!.data;
  }
}
