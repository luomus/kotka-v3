import { Routes } from '@angular/router';
import { AccessionComponent } from './accession/accession.component';
import { NotFoundComponent } from '@kotka/ui/base';

export const accessionsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: AccessionComponent,
  },
  { path: '**', component: NotFoundComponent },
];

