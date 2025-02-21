import { Component, Input } from '@angular/core';
import { Organization, SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionTypeLabelPipe } from '../../pipes/transaction-type-label.pipe';
import { CapitalizeFirstLetterPipe, ToFullUriPipe } from '@kotka/ui/pipes';

@Component({
  imports: [CommonModule, TransactionTypeLabelPipe, ToFullUriPipe, CapitalizeFirstLetterPipe],
  selector: 'kotka-transaction-sheet-incoming-details',
  templateUrl: './transaction-sheet-incoming-details.html',
})
export class TransactionSheetIncomingDetailsComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
  @Input({ required: true }) ownerOrganization?: Organization;
  @Input({ required: true }) correspondingOrganization?: Organization;
}
