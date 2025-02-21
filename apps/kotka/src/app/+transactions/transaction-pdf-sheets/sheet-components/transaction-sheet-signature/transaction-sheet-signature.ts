import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionTypeLabelPipe } from '../../pipes/transaction-type-label.pipe';

@Component({
  imports: [CommonModule, TransactionTypeLabelPipe],
  selector: 'kotka-transaction-sheet-signature',
  templateUrl: './transaction-sheet-signature.html'
})
export class TransactionSheetSignatureComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
  @Input() showCommitToTermsText = true;
}
