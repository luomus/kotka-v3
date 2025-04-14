import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { OnlyLoggedInGuard } from '@kotka/ui/services';
import { NotFoundComponent } from '@kotka/ui/base';

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
    canActivate: [OnlyLoggedInGuard]
  },
  { path: '', pathMatch: 'full', component: NotFoundComponent }
];
