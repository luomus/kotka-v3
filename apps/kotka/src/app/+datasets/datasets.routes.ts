import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { DatasetTableComponent } from './dataset-table/dataset-table.component';
import { DatasetFormComponent } from './dataset-form/dataset-form.component';
import { RoutingUtils } from '../shared/services/routing-utils';

export const datasetsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DatasetTableComponent,
    data: { title: 'Tags' }
  },
  {
    matcher: RoutingUtils.formMatcher,
    component: DatasetFormComponent,
    data: {
      add: { title: 'Add tag' },
      edit: { title: 'Edit tag', addUriToTitle: true }
    }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(datasetsRoutes);
