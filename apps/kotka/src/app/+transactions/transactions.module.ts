import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routing } from './transactions.routes';
import { KotkaUiMainContentModule } from '@kotka/ui/main-content';
import { KotkaUiDatatableModule } from '@kotka/ui/datatable';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { FormViewModule } from '../shared-modules/form-view/form-view.module';
import { SharedModule } from '../shared/shared.module';
import { TransactionTableComponent } from './transaction-table/transaction-table.component';
import { TransactionEventFormComponent } from './transaction-form/transaction-event-form.component';
import { KotkaUiLajiFormModule } from '@kotka/ui/laji-form';
import { OrganizationAddressEmbedComponent } from './transaction-form-embed/organization-address-embed';
import { PermitsInfoEmbedComponent } from './transaction-form-embed/permits-info-embed';
import { SpecimenRangeSelectEmbedComponent } from './transaction-form-embed/specimen-range-select-embed';
import { TransactionVersionHistoryComponent } from './transaction-version-history/transaction-version-history.component';
import { TransactionFormEmbedService } from './transaction-form-embed/transaction-form-embed.service';

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
    TransactionEventFormComponent,
    OrganizationAddressEmbedComponent,
    PermitsInfoEmbedComponent,
    SpecimenRangeSelectEmbedComponent,
    TransactionVersionHistoryComponent,
  ],
  providers: [
    TransactionFormEmbedService
  ]
})
export class TransactionsModule {}
