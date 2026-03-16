import { Component, Input } from '@angular/core';
import { Organization, SpecimenTransaction } from '@luomus/laji-schema';

import { ToFullUriPipe } from '@kotka/ui/core';

@Component({
  imports: [ToFullUriPipe],
  selector: 'kotka-transaction-sheet-header',
  templateUrl: './transaction-sheet-header.html',
})
export class TransactionSheetHeaderComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
  @Input({ required: true }) ownerOrganization?: Organization;
}
