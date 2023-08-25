import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { TransactionTableComponent } from './transaction-table/transaction-table.component';

export const datasetsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: TransactionTableComponent,
    data: { title: 'Transactions' }
  },
  {
    path: 'add',
    pathMatch: 'full',
    component: TransactionFormComponent,
    data: { title: 'Add transaction' }
  },
  {
    path: 'edit',
    pathMatch: 'full',
    component: TransactionFormComponent,
    data: { title: 'Edit transaction', addUriToTitle: true }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(datasetsRoutes);
