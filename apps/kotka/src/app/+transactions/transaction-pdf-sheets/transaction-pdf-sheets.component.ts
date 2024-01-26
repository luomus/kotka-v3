import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges, Type
} from '@angular/core';
import { TransactionDispatchSheetComponent } from './transaction-dispatch-sheet/transaction-dispatch-sheet';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { TransactionPdfSheetsContextService } from './transaction-pdf-sheets-context-service';
import { ComponentWithContext, PdfService } from '@kotka/services';
import { TransactionIncomingSheetComponent } from './transaction-incoming-sheet/transaction-incoming-sheet';
import { TransactionInquirySheetComponent } from './transaction-inquiry-sheet/transaction-inquiry-sheet';
import { TransactionReturnSheetComponent } from './transaction-return-sheet/transaction-return-sheet';
import { TransactionInsectLabelsComponent } from './transaction-insect-labels/transaction-insect-labels';

@Component({
  selector: 'kotka-transaction-pdf-sheets',
  template: `
    <div class="d-xs-flex mb-2">
      <div class="btn-group-vertical col-12">
        <button class="btn btn-light" (click)="downloadDispatchSheet()">Dispatch sheet (PDF)</button>
        <button class="btn btn-light" (click)="downloadIncomingSheet()">Incoming receipt (PDF)</button>
        <button class="btn btn-light" (click)="downloadInquirySheet()">Inquiry sheet (PDF)</button>
        <button class="btn btn-light mb-3" (click)="downloadReturnSheet()">Return sheet (PDF)</button>
        <button class="btn btn-light" (click)="downloadInsectLabels()">Insect labels (PDF)</button>
        <div class="px-3 py-2 w-100 text-center">
          <a
            [href]='("/specimens/search?identifier=" + specimenIdQuery) | oldKotkaUrl'
            target="_blank"
          >
            Export specimens to Excel
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionPdfSheetsComponent implements OnChanges {
  @Input() data?: SpecimenTransaction;

  specimenIdQuery = '';

  constructor(
    private transactionPdfSheetsContext: TransactionPdfSheetsContextService,
    private pdfService: PdfService
  ) {}

  ngOnChanges() {
    const specimenIds = (this.data?.awayIDs || []).concat(this.data?.returnedIDs || []).concat(this.data?.missingIDs || []);
    this.specimenIdQuery = specimenIds.join(',');
  }

  downloadDispatchSheet() {
    this.downloadSheet(TransactionDispatchSheetComponent, 'dispatchsheet');
  }

  downloadIncomingSheet() {
    this.downloadSheet(TransactionIncomingSheetComponent, 'receipt');
  }

  downloadInquirySheet() {
    this.downloadSheet(TransactionInquirySheetComponent, 'inquirysheet');
  }

  downloadReturnSheet() {
    this.downloadSheet(TransactionReturnSheetComponent, 'returnsheet');
  }

  downloadInsectLabels() {
    this.downloadShelfSlip(TransactionInsectLabelsComponent, 'insectlabels');
  }

  private downloadSheet(componentClass: Type<ComponentWithContext>, name: string) {
    if (!this.data) {
      return;
    }

    this.transactionPdfSheetsContext.getSheetContext(this.data).subscribe(context => {
      this.pdfService.downloadSheet(
        componentClass,
        context,
        `${name}_${this.data?.id}.pdf`
      );
    });
  }

  private downloadShelfSlip(componentClass: Type<ComponentWithContext>, name: string) {
    if (!this.data) {
      return;
    }

    this.transactionPdfSheetsContext.getShelfSlipContext(this.data).subscribe(context => {
      this.pdfService.downloadSheet(
        componentClass,
        context,
        `${name}_${this.data?.id}.pdf`
      );
    });
  }
}
