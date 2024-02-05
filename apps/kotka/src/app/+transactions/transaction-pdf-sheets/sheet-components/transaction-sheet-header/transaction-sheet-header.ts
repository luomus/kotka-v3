import { Component, Input } from '@angular/core';
import { Organization, SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { PipesModule } from '@kotka/pipes';

@Component({
  standalone: true,
  imports: [CommonModule, PipesModule],
  selector: 'kotka-transaction-sheet-header',
  templateUrl: './transaction-sheet-header.html'
})
export class TransactionSheetHeaderComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
  @Input({ required: true }) ownerOrganization?: Organization;
}
