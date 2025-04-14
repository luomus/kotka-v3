import { Routes } from '@angular/router';
import { DatasetTableComponent } from './dataset-table/dataset-table.component';
import { DatasetFormComponent } from './dataset-form/dataset-form.component';
import { formMatcher } from '@kotka/ui/services';
import { ComponentCanDeactivateGuard } from '@kotka/ui/services';
import { DatasetVersionHistoryComponent } from './dataset-version-history/dataset-version-history.component';

export const datasetsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DatasetTableComponent,
    data: { title: 'Tags' }
  },
  {
    matcher: formMatcher,
    component: DatasetFormComponent,
    data: {
      add: { title: 'Add tag' },
      edit: { title: 'Edit tag', addUriToTitle: true }
    },
    canDeactivate: [ ComponentCanDeactivateGuard ],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'history',
    pathMatch: 'full',
    component: DatasetVersionHistoryComponent,
    data: {
      title: 'Transaction',
      addUriToTitle: true
    }
  }
];
