import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routing } from './transactions.routes';
import { KotkaUiMainContentModule } from '../../../../../libs/kotka/ui/main-content/src';
import { KotkaUiDatatableModule } from '../../../../../libs/kotka/ui/datatable/src';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { FormViewModule } from '../shared-modules/form-view/form-view.module';
import { SharedModule } from '../shared/shared.module';
import { TransactionTableComponent } from './transaction-table/transaction-table.component';
import { TransactionEventFormComponent } from './transaction-form/transaction-event-form.component';
import { KotkaUiLajiFormModule } from '@kotka/ui/laji-form';

@NgModule({
  imports: [
    routing,
    RouterModule,
    CommonModule,
    SharedModule,
    KotkaUiMainContentModule,
    KotkaUiDatatableModule,
    FormViewModule,
    KotkaUiLajiFormModule,
  ],
  declarations: [
    TransactionFormComponent,
    TransactionTableComponent,
    TransactionEventFormComponent
  ],
})
export class TransactionsModule {}
