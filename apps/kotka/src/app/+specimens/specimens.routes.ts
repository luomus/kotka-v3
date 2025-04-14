import { Routes } from '@angular/router';
import { SpecimenFormComponent } from './specimen-form/specimen-form.component';
import { ComponentCanDeactivateGuard, formMatcher } from '@kotka/ui/services';

export const specimensRoutes: Routes = [
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
