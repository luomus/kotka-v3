import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { DatasetTableComponent } from './dataset-table/dataset-table.component';
import { DatasetFormComponent } from './dataset-form/dataset-form.component';
import { RoutingUtils } from '../shared/services/routing-utils';
import { ComponentCanDeactivateGuard } from '../shared/services/guards/component-can-deactivate.guard';

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
    },
    canDeactivate: [ ComponentCanDeactivateGuard ]
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(datasetsRoutes);
