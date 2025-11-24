import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';


@Component({
  imports: [],
  selector: 'kotka-transaction-sheet-remarks',
  templateUrl: './transaction-sheet-remarks.html'
})
export class TransactionSheetRemarksComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
}
