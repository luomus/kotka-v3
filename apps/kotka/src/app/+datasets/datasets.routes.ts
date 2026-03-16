import { Routes } from '@angular/router';
import { DatasetTableComponent } from './dataset-table/dataset-table.component';
import { DatasetFormComponent } from './dataset-form/dataset-form.component';
import { formMatcher, ComponentCanDeactivateGuard } from '@kotka/ui/core';
import { DatasetVersionHistoryComponent } from './dataset-version-history/dataset-version-history.component';

export const datasetsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DatasetTableComponent
  },
  {
    matcher: formMatcher,
    component: DatasetFormComponent,
    canDeactivate: [ ComponentCanDeactivateGuard ],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'history',
    pathMatch: 'full',
    component: DatasetVersionHistoryComponent
  }
];
