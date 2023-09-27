import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { TransactionTableComponent } from './transaction-table/transaction-table.component';
import { RoutingUtils } from '../shared/services/routing-utils';

export const datasetsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: TransactionTableComponent,
    data: { title: 'Transactions' }
  },
  {
    matcher: RoutingUtils.formMatcher,
    component: TransactionFormComponent,
    data: {
      add: { title: 'Add transaction' },
      edit: { title: 'Edit transaction', addUriToTitle: true }
    }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(datasetsRoutes);
