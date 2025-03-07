import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  Type,
} from '@angular/core';
import { TransactionDispatchSheetComponent } from './transaction-dispatch-sheet/transaction-dispatch-sheet';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { TransactionPdfSheetsContextService } from './services/transaction-pdf-sheets-context-service';
import { PdfTemplateComponent, PdfService } from '@kotka/ui/data-services';
import { TransactionIncomingSheetComponent } from './transaction-incoming-sheet/transaction-incoming-sheet';
import { TransactionInquirySheetComponent } from './transaction-inquiry-sheet/transaction-inquiry-sheet';
import { TransactionReturnSheetComponent } from './transaction-return-sheet/transaction-return-sheet';
import { TransactionInsectLabelsComponent } from './transaction-insect-labels/transaction-insect-labels';
import { Observable, switchMap } from 'rxjs';
import { TransactionBotanyLabelsComponent } from './transaction-botany-labels/transaction-botany-labels';
import { SpinnerComponent } from '@kotka/ui/spinner';
import { OldKotkaUrlPipe } from '../../shared/pipes/old-kotka-url.pipe';

@Component({
  selector: 'kotka-transaction-pdf-sheets',
  template: `
    <div class="d-sm-inline-block mb-2 position-relative">
      <kui-spinner [overlay]="true" [spinning]="loading">
        <div class="btn-group-vertical col-12">
          <button
            class="btn btn-light"
            (click)="downloadDispatchSheet()"
            [disabled]="loading"
          >
            Dispatch sheet (PDF)
          </button>
          <button
            class="btn btn-light"
            (click)="downloadIncomingSheet()"
            [disabled]="loading"
          >
            Incoming receipt (PDF)
          </button>
          <button
            class="btn btn-light"
            (click)="downloadInquirySheet()"
            [disabled]="loading"
          >
            Inquiry sheet (PDF)
          </button>
          <button
            class="btn btn-light mb-3"
            (click)="downloadReturnSheet()"
            [disabled]="loading"
          >
            Return sheet (PDF)
          </button>
          <button
            class="btn btn-light"
            (click)="downloadInsectLabels()"
            [disabled]="loading"
          >
            Insect labels (PDF)
          </button>
          <button
            class="btn btn-light"
            (click)="downloadBotanyLabels()"
            [disabled]="loading"
          >
            Botany labels (PDF)
          </button>
          <div class="px-3 py-2 w-100 text-center">
            <a
              [href]="
                '/specimens/search?identifier=' + specimenIdQuery | oldKotkaUrl
              "
              target="_blank"
            >
              Export specimens to Excel
            </a>
          </div>
        </div>
      </kui-spinner>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        text-align: right;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent, OldKotkaUrlPipe],
})
export class TransactionPdfSheetsComponent implements OnChanges {
  @Input() data?: SpecimenTransaction;

  specimenIdQuery = '';

  loading = false;

  constructor(
    private transactionPdfSheetsContext: TransactionPdfSheetsContextService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges() {
    const specimenIds = (this.data?.awayIDs || [])
      .concat(this.data?.returnedIDs || [])
      .concat(this.data?.missingIDs || []);
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
    if (!this.data) {
      return;
    }
    const context$ = this.transactionPdfSheetsContext.getInsectShelfSlipContext(
      this.data,
    );
    this.downloadSheet(
      TransactionInsectLabelsComponent,
      'insectlabels',
      context$,
    );
  }

  downloadBotanyLabels() {
    if (!this.data) {
      return;
    }
    const context$ = this.transactionPdfSheetsContext.getBotanyShelfSlipContext(
      this.data,
    );
    this.downloadSheet(
      TransactionBotanyLabelsComponent,
      'botanylabels',
      context$,
    );
  }

  private downloadSheet(
    componentClass: Type<PdfTemplateComponent>,
    name: string,
    context$?: Observable<any>,
  ) {
    if (!this.data) {
      return;
    }

    this.loading = true;

    (context$ || this.transactionPdfSheetsContext.getSheetContext(this.data))
      .pipe(
        switchMap((context) => this.download(componentClass, context, name)),
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private download(
    componentClass: Type<PdfTemplateComponent>,
    context: any,
    name: string,
  ) {
    return this.pdfService.downloadSheet(
      componentClass,
      context,
      `${name}_${this.data?.id}.pdf`,
    );
  }
}
