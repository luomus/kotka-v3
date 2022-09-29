import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { DatasetsComponent } from './datasets.component';
import { DatasetFormComponent } from './dataset-form/dataset-form.component';

export const datasetsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DatasetsComponent
  },
  {
    path: 'add',
    pathMatch: 'full',
    component: DatasetFormComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(datasetsRoutes);
