import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { DatasetsComponent } from './datasets.component';
import { DatasetFormComponent } from './dataset-form/dataset-form.component';

export const datasetsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DatasetsComponent,
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
