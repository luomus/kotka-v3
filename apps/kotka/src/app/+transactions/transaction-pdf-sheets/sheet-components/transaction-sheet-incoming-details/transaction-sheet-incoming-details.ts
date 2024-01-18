import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { PipesModule } from '@kotka/pipes';
import { LajiOrganization } from '@kotka/shared/models';

@Component({
  standalone: true,
  imports: [CommonModule, PipesModule],
  selector: 'kotka-transaction-sheet-incoming-details',
  templateUrl: './transaction-sheet-incoming-details.html'
})
export class TransactionSheetIncomingDetailsComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
  @Input({ required: true }) ownerOrganization?: LajiOrganization;
  @Input({ required: true }) correspondingOrganization?: LajiOrganization;
}
