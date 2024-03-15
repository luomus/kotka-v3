import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routing } from './pdf-demo.routes';
import { SharedModule } from '../shared/shared.module';
import { PdfDemoComponent } from './pdf-demo.component';
import {
  TransactionDispatchSheetComponent
} from '../+transactions/transaction-pdf-sheets/transaction-dispatch-sheet/transaction-dispatch-sheet';
import {
    TransactionIncomingSheetComponent
} from '../+transactions/transaction-pdf-sheets/transaction-incoming-sheet/transaction-incoming-sheet';
import {
  TransactionInquirySheetComponent
} from '../+transactions/transaction-pdf-sheets/transaction-inquiry-sheet/transaction-inquiry-sheet';
import {
    TransactionReturnSheetComponent
} from '../+transactions/transaction-pdf-sheets/transaction-return-sheet/transaction-return-sheet';
import {
    TransactionInsectLabelsComponent
} from '../+transactions/transaction-pdf-sheets/transaction-insect-labels/transaction-insect-labels';
import {
    TransactionBotanyLabelsComponent
} from '../+transactions/transaction-pdf-sheets/transaction-botany-labels/transaction-botany-labels';

@NgModule({
    imports: [
        routing,
        RouterModule,
        CommonModule,
        SharedModule,
        TransactionDispatchSheetComponent,
        TransactionIncomingSheetComponent,
        TransactionInquirySheetComponent,
        TransactionReturnSheetComponent,
        TransactionInsectLabelsComponent,
        TransactionBotanyLabelsComponent
    ],
  declarations: [
    PdfDemoComponent
  ],
  providers: []
})
export class PdfDemoModule {}
