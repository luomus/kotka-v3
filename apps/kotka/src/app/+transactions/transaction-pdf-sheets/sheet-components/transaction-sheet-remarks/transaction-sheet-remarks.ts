import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'kotka-transaction-sheet-remarks',
  templateUrl: './transaction-sheet-remarks.html'
})
export class TransactionSheetRemarksComponent {
  @Input({ required: true }) data!: SpecimenTransaction;
}
