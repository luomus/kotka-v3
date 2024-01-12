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

@NgModule({
    imports: [
        routing,
        RouterModule,
        CommonModule,
        SharedModule,
        TransactionDispatchSheetComponent,
        TransactionIncomingSheetComponent
    ],
  declarations: [
    PdfDemoComponent
  ],
  providers: []
})
export class PdfDemoModule {}
