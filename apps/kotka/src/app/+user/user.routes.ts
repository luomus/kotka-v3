import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { OnlyLoggedIn } from '../shared/services/only-logged-in';
import { NotFoundComponent } from '../shared/components/not-found/not-found.component';

export const userRoutes: Routes = [
  {
    path: 'login',
    pathMatch: 'full',
    component: LoginComponent
  },
  {
    path: 'logout',
    pathMatch: 'full',
    component: LogoutComponent,
    canActivate: [OnlyLoggedIn]
  },
  { path: '', pathMatch: 'full', component: NotFoundComponent }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(userRoutes);
