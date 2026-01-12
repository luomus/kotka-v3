import { Routes } from '@angular/router';
import { LabelDesignerComponent } from '@kotka/ui/label-designer';

export const toolsRoutes: Routes = [
  {
    path: 'generic-label',
    pathMatch: 'full',
    component: LabelDesignerComponent
  }
];
