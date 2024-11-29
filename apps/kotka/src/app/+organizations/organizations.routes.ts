import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { OrganizationTableComponent } from './dataset-table/organization-table.component';
import { OrganizationFormComponent } from './organization-form/organization-form.component';
import { Utils } from '../shared/services/utils';
import { ComponentCanDeactivateGuard } from '../shared/services/guards/component-can-deactivate.guard';
import { OrganizationVersionHistoryComponent } from './organization-version-history/organization-version-history.component';

export const organizationsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OrganizationTableComponent,
    data: { title: 'Organizations' }
  },
  {
    matcher: Utils.formMatcher,
    component: OrganizationFormComponent,
    data: {
      add: { title: 'Add organization' },
      edit: { title: 'Edit organization', addUriToTitle: true }
    },
    canDeactivate: [ ComponentCanDeactivateGuard ],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'history',
    pathMatch: 'full',
    component: OrganizationVersionHistoryComponent,
    data: {
      title: 'Organization',
      addUriToTitle: true
    }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(organizationsRoutes);
