import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionShelfSlipContext } from '../transaction-pdf-sheets-context-service';
import { ComponentWithContext } from '@kotka/services';
import { PipesModule } from '@kotka/pipes';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    PipesModule
  ],
  selector: 'kotka-transaction-insect-labels',
  templateUrl: './transaction-insect-labels.html'
})
export class TransactionInsectLabelsComponent implements ComponentWithContext {
  @Input({ required: true }) context!: TransactionShelfSlipContext;

  get data(): SpecimenTransaction {
    return this.context.data;
  }

  get allSpecimens(): string[] {
    return (this.data.awayIDs || []).concat(this.data.returnedIDs || []).concat(this.data.missingIDs || []);
  }
}
