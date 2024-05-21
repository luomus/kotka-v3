import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionInsectShelfSlipContext } from '../transaction-pdf-sheets-context-service';
import { PdfTemplateComponent } from '@kotka/services';
import { PipesModule } from '@kotka/pipes';
import { TransactionTypeLabelPipe } from '../pipes/transaction-type-label.pipe';

interface SpecimenWithinPage {
  id: string;
  row: number;
  col: number;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    PipesModule,
    TransactionTypeLabelPipe
  ],
  selector: 'kotka-transaction-insect-labels',
  templateUrl: './transaction-insect-labels.html'
})
export class TransactionInsectLabelsComponent implements PdfTemplateComponent {
  @Input({ required: true }) context!: TransactionInsectShelfSlipContext;

  specimensPerRow = 7;
  specimensPerCol = 25;

  get data(): SpecimenTransaction {
    return this.context.data;
  }

  get pagedSpecimens(): SpecimenWithinPage[][] {
    const result: SpecimenWithinPage[][] = [];

    const allSpecimens = [...this.allSpecimens];

    let isFirstPage = true;

    while (allSpecimens.length > 0) {
      const pageResult: SpecimenWithinPage[] = [];
      const specimensPerCol = this.specimensPerCol - (isFirstPage ? 1 : 0);
      const pageSpecimens = allSpecimens.splice(0, this.specimensPerRow * specimensPerCol);

      let col = 0;
      while (pageSpecimens.length > 0) {
        const colSpecimens = pageSpecimens.splice(0, specimensPerCol);
        for (let row = 0; row < colSpecimens.length; row++) {
          pageResult.push({
            id: colSpecimens[row],
            row,
            col
          });
        }
        col++;
      }

      result.push(pageResult);
      isFirstPage = false;
    }

    if (result.length === 0) {
      result.push([]);
    }

    return result;
  }

  get allSpecimens(): string[] {
    return (this.data.awayIDs || []).concat(this.data.returnedIDs || []).concat(this.data.missingIDs || []);
  }
}
