import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { StatusComponent } from './status.component';

export const statusRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: StatusComponent
  }
];
