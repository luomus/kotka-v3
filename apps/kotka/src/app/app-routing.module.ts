import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { QuicklinkStrategy } from 'ngx-quicklink';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { OnlyLoggedInGuard} from './shared/services/guards/only-logged-in.guard';
import { BaseComponent } from './shared/components/base/base.component';
import { environment } from '../environments/environment';

const baseRoutes: Routes = [
  { path: 'user', loadChildren: () => import('./+user/user.module').then(m => m.UserModule), data: {preload: false} },
  { path: '', canActivate: [OnlyLoggedInGuard], children: [
      { path: 'tags', loadChildren: () => import('./+datasets/datasets.module').then(m => m.DatasetsModule), data: {preload: false} },
      { path: 'organizations', loadChildren: () => import('./+organizations/organizations.module').then(m => m.OrganizationsModule), data: {preload: false} },
      { path: 'transactions', loadChildren: () => import('./+transactions/transactions.module').then(m => m.TransactionsModule), data: {preload: false} },
      { path: '**', pathMatch: 'full', component: NotFoundComponent }
    ]
  }
];

export const routes: Routes = [
  { path: 'status', loadChildren: () => import('./+status/status.module').then(m => m.StatusModule), data: {preload: false} },
  { path: '', component: BaseComponent, children: baseRoutes }
];

if (!environment.production) {
  routes.unshift({ path: 'pdf-demo', canActivate: [OnlyLoggedInGuard], loadChildren: () => import('./+pdf-demo/pdf-demo.module').then(m => m.PdfDemoModule), data: {preload: false} });
}

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
    preloadingStrategy: QuicklinkStrategy,
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
