import { Component, Input } from '@angular/core';
import { Organization, SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionTypeLabelPipe } from '../../pipes/transaction-type-label.pipe';
import { CapitalizeFirstLetterPipe } from '@kotka/ui/pipes';

@Component({
  imports: [CommonModule, TransactionTypeLabelPipe, CapitalizeFirstLetterPipe],
  selector: 'kotka-transaction-sheet-incoming-return-details',
  templateUrl: './transaction-sheet-incoming-return-details.html',
})
export class TransactionSheetIncomingReturnDetailsComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
  @Input({ required: true }) ownerOrganization?: Organization;
  @Input({ required: true }) correspondingOrganization?: Organization;
}
