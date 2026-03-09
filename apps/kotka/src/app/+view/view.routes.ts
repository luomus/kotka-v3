import { Routes } from '@angular/router';
import { ViewerComponent } from './viewer/viewer.component';

export const viewRoutes: Routes = [
  { path: '', pathMatch: 'full', component: ViewerComponent },
];
