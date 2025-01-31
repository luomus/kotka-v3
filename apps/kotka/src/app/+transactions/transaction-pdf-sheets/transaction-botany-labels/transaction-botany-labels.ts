import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionBotanyShelfSlipContext } from '../services/transaction-pdf-sheets-context-service';
import { PdfTemplateComponent } from '@kotka/services';
import { PipesModule } from '@kotka/pipes';
import { QRCodeModule } from 'angularx-qrcode';
import { TransactionTypeLabelPipe } from '../pipes/transaction-type-label.pipe';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    PipesModule,
    QRCodeModule,
    TransactionTypeLabelPipe
  ],
  selector: 'kotka-transaction-botany-labels',
  templateUrl: './transaction-botany-labels.html'
})
export class TransactionBotanyLabelsComponent implements PdfTemplateComponent {
  @Input({ required: true }) context!: TransactionBotanyShelfSlipContext;

  @Output() componentIsReady: EventEmitter<true> = new EventEmitter<true>();

  constructor() {
    setTimeout(() => {
      this.componentIsReady.emit(true);
    }, 300); // wait for the qrcode to render
  }

  get data(): SpecimenTransaction {
    return this.context.data;
  }
}
