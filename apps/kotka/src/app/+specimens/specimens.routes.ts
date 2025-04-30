import { Routes } from '@angular/router';
import { SpecimenFormComponent } from './specimen-form/specimen-form.component';
import { ComponentCanDeactivateGuard, formMatcher } from '@kotka/ui/services';
import { SpecimenTableComponent } from './specimen-table/specimen-table.component';

export const specimensRoutes: Routes = [
  {
    path: 'search',
    pathMatch: 'full',
    component: SpecimenTableComponent,
    data: { title: 'Search specimens' }
  },
  {
    matcher: formMatcher,
    component: SpecimenFormComponent,
    data: {
      add: { title: 'Add specimen' },
      edit: { title: 'Edit specimen', addUriToTitle: true }
    },
    canDeactivate: [ ComponentCanDeactivateGuard ],
    runGuardsAndResolvers: 'always'
  }
];
