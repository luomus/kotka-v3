import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { TransactionSheetMaterialComponent } from '../transaction-sheet-material/transaction-sheet-material';
import { TransactionSheetSignatureComponent } from '../transaction-sheet-signature/transaction-sheet-signature';

@Component({
  imports: [
    TransactionSheetMaterialComponent,
    TransactionSheetSignatureComponent
  ],
  selector: 'kotka-transaction-sheet-signature-and-material',
  templateUrl: './transaction-sheet-signature-and-material.html'
})
export class TransactionSheetSignatureAndMaterialComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
  @Input() showCommitToTermsText = true;
}
