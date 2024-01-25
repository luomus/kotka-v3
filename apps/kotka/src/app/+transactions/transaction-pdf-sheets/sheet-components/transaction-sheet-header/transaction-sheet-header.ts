import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { PipesModule } from '@kotka/pipes';
import { LajiOrganization } from '@kotka/shared/models';

@Component({
  standalone: true,
  imports: [CommonModule, PipesModule],
  selector: 'kotka-transaction-sheet-header',
  templateUrl: './transaction-sheet-header.html'
})
export class TransactionSheetHeaderComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
  @Input({ required: true }) ownerOrganization?: LajiOrganization;
}
