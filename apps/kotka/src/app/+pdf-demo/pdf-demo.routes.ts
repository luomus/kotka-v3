import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { PdfDemoComponent } from './pdf-demo.component';

export const pdfDemoRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PdfDemoComponent,
    data: { title: 'Pdf demo' }
  }
];
