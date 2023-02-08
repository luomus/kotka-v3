import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { QuicklinkStrategy } from 'ngx-quicklink';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { OnlyLoggedInGuard } from './shared/services/guards/only-logged-in.guard';
import { BaseComponent } from './shared/components/base/base.component';

const baseRoutes: Routes = [
  { path: 'user', loadChildren: () => import('./+user/user.module').then(m => m.UserModule), data: {preload: false} },
  { path: '', canActivate: [OnlyLoggedInGuard], children: [
      { path: 'tags', loadChildren: () => import('./+datasets/datasets.module').then(m => m.DatasetsModule), data: {preload: false} },
      { path: '**', pathMatch: 'full', component: NotFoundComponent }
    ]
  }
];

export const routes: Routes = [
  { path: 'status', loadChildren: () => import('./+status/status.module').then(m => m.StatusModule), data: {preload: false} },
  { path: '', component: BaseComponent, children: baseRoutes }
];

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
