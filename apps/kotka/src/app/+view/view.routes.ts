import { Routes } from '@angular/router';
import { ViewComponent } from './view/view.component';

export const viewRoutes: Routes = [
  { path: '', pathMatch: 'full', component: ViewComponent },
];
