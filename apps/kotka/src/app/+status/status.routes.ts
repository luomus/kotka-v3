import { Routes } from '@angular/router';
import { StatusComponent } from './status.component';

export const statusRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: StatusComponent
  }
];
