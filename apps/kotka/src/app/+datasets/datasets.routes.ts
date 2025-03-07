import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { DatasetTableComponent } from './dataset-table/dataset-table.component';
import { DatasetFormComponent } from './dataset-form/dataset-form.component';
import { Utils } from '../shared/services/utils';
import { ComponentCanDeactivateGuard } from '../shared/services/guards/component-can-deactivate.guard';
import { DatasetVersionHistoryComponent } from './dataset-version-history/dataset-version-history.component';

export const datasetsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DatasetTableComponent,
    data: { title: 'Tags' }
  },
  {
    matcher: Utils.formMatcher,
    component: DatasetFormComponent,
    data: {
      add: { title: 'Add tag' },
      edit: { title: 'Edit tag', addUriToTitle: true }
    },
    canDeactivate: [ ComponentCanDeactivateGuard ],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'history',
    pathMatch: 'full',
    component: DatasetVersionHistoryComponent,
    data: {
      title: 'Transaction',
      addUriToTitle: true
    }
  }
];
