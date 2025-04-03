import { Routes } from '@angular/router';
import { PdfDemoComponent } from './pdf-demo.component';

export const pdfDemoRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PdfDemoComponent,
    data: { title: 'Pdf demo' }
  }
];
