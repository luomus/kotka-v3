import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionBotanyShelfSlipContext } from '../services/transaction-pdf-sheets-context-service';
import { PdfTemplateComponent } from '@kotka/ui/data-services';
import { TransactionTypeLabelPipe } from '../pipes/transaction-type-label.pipe';
import { QRCodeComponent } from 'angularx-qrcode';
import { ToFullUriPipe } from '@kotka/ui/pipes';

@Component({
  imports: [CommonModule, TransactionTypeLabelPipe, QRCodeComponent, ToFullUriPipe],
  selector: 'kotka-transaction-botany-labels',
  templateUrl: './transaction-botany-labels.html',
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
