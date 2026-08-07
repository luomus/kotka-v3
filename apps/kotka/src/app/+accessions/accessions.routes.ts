import { Routes } from '@angular/router';
import { AccessionComponent } from './accession/accession.component';
import { NotFoundComponent } from '@kotka/ui/base';
import { ComponentCanDeactivateGuard } from '@kotka/ui/core';

export const accessionsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: AccessionComponent,
    canDeactivate: [ComponentCanDeactivateGuard],
  },
  { path: '**', component: NotFoundComponent },
];

