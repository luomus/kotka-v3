import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { QuicklinkStrategy } from 'ngx-quicklink';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { OnlyLoggedIn } from './shared/services/only-logged-in';

const baseRoutes: Routes = [
  { path: 'user', loadChildren: () => import('./+user/user.module').then(m => m.UserModule), data: {preload: false} },
  { path: '', canActivate: [OnlyLoggedIn], children: [
      { path: 'datasets', loadChildren: () => import('./+datasets/datasets.module').then(m => m.DatasetsModule), data: {preload: false}},
      { path: '**', pathMatch: 'full', component: NotFoundComponent }
    ]
  }
];

export const routes: Routes = [
  { path: '', children: baseRoutes }
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
