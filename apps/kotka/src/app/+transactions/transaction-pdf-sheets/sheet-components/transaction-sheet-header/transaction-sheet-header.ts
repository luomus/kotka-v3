import { Component, Input } from '@angular/core';
import { Organization, SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { ToFullUriPipe } from '@kotka/ui/pipes';

@Component({
  imports: [CommonModule, ToFullUriPipe],
  selector: 'kotka-transaction-sheet-header',
  templateUrl: './transaction-sheet-header.html',
})
export class TransactionSheetHeaderComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
  @Input({ required: true }) ownerOrganization?: Organization;
}
