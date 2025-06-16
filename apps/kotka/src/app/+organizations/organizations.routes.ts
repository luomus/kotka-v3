import { Routes } from '@angular/router';
import { OrganizationTableComponent } from './organization-table/organization-table.component';
import { OrganizationFormComponent } from './organization-form/organization-form.component';
import { formMatcher } from '@kotka/ui/services';
import { ComponentCanDeactivateGuard } from '@kotka/ui/services';
import { OrganizationVersionHistoryComponent } from './organization-version-history/organization-version-history.component';

export const organizationsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OrganizationTableComponent
  },
  {
    matcher: formMatcher,
    component: OrganizationFormComponent,
    data: {
      add: { title: 'Add organization' }
    },
    canDeactivate: [ ComponentCanDeactivateGuard ],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'history',
    pathMatch: 'full',
    component: OrganizationVersionHistoryComponent
  }
];
