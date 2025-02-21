import { Component, Input } from '@angular/core';
import { Organization, SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { PipesModule } from '@kotka/ui/pipes';
import { LajiForm } from '@kotka/shared/models';
import { TransactionTypeLabelPipe } from '../../pipes/transaction-type-label.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, PipesModule, TransactionTypeLabelPipe],
  selector: 'kotka-transaction-sheet-outgoing-details',
  templateUrl: './transaction-sheet-outgoing-details.html',
})
export class TransactionSheetOutgoingDetailsComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
  @Input({ required: true }) correspondingOrganization?: Organization;
  @Input({ required: true }) fieldData!: Record<string, LajiForm.Field>;
}
