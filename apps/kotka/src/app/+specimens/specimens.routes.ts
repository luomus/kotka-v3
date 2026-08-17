import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { SpecimenFormComponent } from './specimen-form/specimen-form.component';
import { ComponentCanDeactivateGuard, formMatcher } from '@kotka/ui/core';
import { SpecimenTableComponent } from './specimen-table/specimen-table.component';
import { SpecimenVersionHistoryComponent } from './specimen-version-history/specimen-version-history.component';
import { BranchSearchComponent } from './branch-search/branch-search.component';
import { NotFoundComponent } from '@kotka/ui/base';

function specimenFormMatcher(segments: UrlSegment[]): UrlMatchResult|null {
  if (['botany', 'zoo', 'palaeontology', 'accession', 'culture'].includes(segments[0]?.path) && segments[1]?.path === 'specimens') {
    return {
      consumed: [segments[0], segments[1]],
      posParams: {
        specimenDataType: segments[0]
      }
    };
  } else if (segments[0]?.path === 'specimens' && segments[1]?.path !== 'add') {
    return {
      consumed: [segments[0]],
      posParams: {}
    };
  }
  return null;
}

export const specimensRoutes: Routes = [
  {
    path: 'specimens',
    children: [
      {
        path: 'search',
        pathMatch: 'full',
        component: SpecimenTableComponent,
      },
      {
        path: 'search-branch',
        pathMatch: 'full',
        component: BranchSearchComponent,
      },
      {
        path: 'history',
        pathMatch: 'full',
        component: SpecimenVersionHistoryComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        component: NotFoundComponent,
      },
    ],
  },
  {
    matcher: specimenFormMatcher,
    data: {
      forceRouteRefresh: true,
    },
    children: [
      {
        matcher: formMatcher,
        component: SpecimenFormComponent,
        canDeactivate: [ComponentCanDeactivateGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: '**',
        pathMatch: 'full',
        component: NotFoundComponent,
      },
    ],
  },
];
