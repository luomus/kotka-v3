import { Routes } from '@angular/router';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { TransactionTableComponent } from './transaction-table/transaction-table.component';
import { formMatcher, ComponentCanDeactivateGuard } from '@kotka/ui/core';
import { TransactionVersionHistoryComponent } from './transaction-version-history/transaction-version-history.component';

export const transactionsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: TransactionTableComponent
  },
  {
    matcher: formMatcher,
    component: TransactionFormComponent,
    canDeactivate: [ ComponentCanDeactivateGuard ],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'history',
    pathMatch: 'full',
    component: TransactionVersionHistoryComponent
  }
];
