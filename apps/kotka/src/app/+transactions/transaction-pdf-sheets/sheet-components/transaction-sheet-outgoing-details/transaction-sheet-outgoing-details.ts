import { Component, Input } from '@angular/core';
import { Organization, SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { LajiForm } from '@kotka/shared/models';
import { TransactionTypeLabelPipe } from '../../pipes/transaction-type-label.pipe';
import { CapitalizeFirstLetterPipe, EnumPipe, ToFullUriPipe } from '@kotka/ui/pipes';

@Component({
  imports: [CommonModule, TransactionTypeLabelPipe, ToFullUriPipe, CapitalizeFirstLetterPipe, EnumPipe],
  selector: 'kotka-transaction-sheet-outgoing-details',
  templateUrl: './transaction-sheet-outgoing-details.html'
})
export class TransactionSheetOutgoingDetailsComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
  @Input({ required: true }) correspondingOrganization?: Organization;
  @Input({ required: true }) fieldData!: Record<string, LajiForm.Field>;
}
