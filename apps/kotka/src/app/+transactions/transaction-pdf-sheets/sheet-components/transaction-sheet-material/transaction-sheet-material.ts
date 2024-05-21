import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { PipesModule } from '@kotka/pipes';
import { TransactionTypeLabelPipe } from '../../pipes/transaction-type-label.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, PipesModule, TransactionTypeLabelPipe],
  selector: 'kotka-transaction-sheet-material',
  templateUrl: './transaction-sheet-material.html'
})
export class TransactionSheetMaterialComponent {
  @Input({ required: true }) data!: SpecimenTransaction;

  get totalAwayCount(): number {
    return (this.data.awayIDs || []).length + (this.data.awayCount || 0);
  }
}
