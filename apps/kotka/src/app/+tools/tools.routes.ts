import { Routes } from '@angular/router';
import { GenericLabelDesignerComponent } from './generic-label-designer/generic-label-designer.component';

export const toolsRoutes: Routes = [
  {
    path: 'generic-label',
    pathMatch: 'full',
    component: GenericLabelDesignerComponent
  }
];
