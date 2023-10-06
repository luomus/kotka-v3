import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { TransactionTableComponent } from './transaction-table/transaction-table.component';
import { RoutingUtils } from '../shared/services/routing-utils';
import { ComponentCanDeactivateGuard } from '../shared/services/guards/component-can-deactivate.guard';
import { TransactionVersionHistoryComponent } from './transaction-version-history/transaction-version-history.component';

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
    },
    canDeactivate: [ ComponentCanDeactivateGuard ]
  },
  {
    path: 'history',
    pathMatch: 'full',
    component: TransactionVersionHistoryComponent,
    data: {
      title: 'Transaction',
      addUriToTitle: true
    }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(datasetsRoutes);
