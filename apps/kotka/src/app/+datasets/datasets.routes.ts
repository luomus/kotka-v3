import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { DatasetTableComponent } from './dataset-table/dataset-table.component';
import { DatasetFormComponent } from './dataset-form/dataset-form.component';

export const datasetsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DatasetTableComponent,
    data: { title: 'Tags' }
  },
  {
    path: 'add',
    pathMatch: 'full',
    component: DatasetFormComponent,
    data: { title: 'Add tag' }
  },
  {
    path: 'edit',
    pathMatch: 'full',
    component: DatasetFormComponent,
    data: { title: 'Edit tag', addUriToTitle: true }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(datasetsRoutes);
