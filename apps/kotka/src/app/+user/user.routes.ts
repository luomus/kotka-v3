import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { OnlyLoggedIn } from '../shared/services/only-logged-in';

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
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(userRoutes);
