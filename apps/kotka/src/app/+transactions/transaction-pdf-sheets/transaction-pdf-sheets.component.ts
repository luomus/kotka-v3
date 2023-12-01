import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges
} from '@angular/core';
import { TransactionDispatchSheetComponent } from './transaction-dispatch-sheet/transaction-dispatch-sheet';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { TransactionPdfSheetsContextService } from './transaction-pdf-sheets-context-service';
import { PdfService } from '../../shared/services/pdf.service';

@Component({
  selector: 'kotka-transaction-pdf-sheets',
  template: `
    <div class="d-xs-flex mb-2">
      <div class="btn-group-vertical col-12">
        <button class="btn btn-light" (click)="downloadDispatchSheet()">Dispatch sheet (PDF)</button>
        <button class="btn btn-light" [disabled]="true">Incoming receipt (PDF)</button>
        <button class="btn btn-light" [disabled]="true">Inquiry sheet (PDF)</button>
        <button class="btn btn-light mb-3" [disabled]="true">Return sheet (PDF)</button>
        <button class="btn btn-light" [disabled]="true">Insect labels (PDF)</button>
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
    if (!this.data) {
      return;
    }

    this.transactionPdfSheetsContext.getDispatchSheetContext(this.data).subscribe(context => {
      this.pdfService.downloadSheet(
        TransactionDispatchSheetComponent,
        context,
        `dispatchsheet_${this.data?.id}.pdf`
      );
    });
  }
}
