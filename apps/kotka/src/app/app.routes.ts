import { Routes } from '@angular/router';
import { NotFoundComponent } from '@kotka/ui/base';
import { OnlyLoggedInGuard} from '@kotka/ui/services';
import { BaseComponent } from '@kotka/ui/base';
import { environment } from '../environments/environment';

const baseRoutes: Routes = [
  { path: 'user', loadChildren: () => import('./+user/user.routes').then(m => m.userRoutes), data: {preload: false} },
  { path: '', canActivate: [OnlyLoggedInGuard], children: [
      { path: 'tags', loadChildren: () => import('./+datasets/datasets.routes').then(m => m.datasetsRoutes), data: {preload: false} },
      { path: 'organizations', loadChildren: () => import('./+organizations/organizations.routes').then(m => m.organizationsRoutes), data: {preload: false} },
      { path: 'transactions', loadChildren: () => import('./+transactions/transactions.routes').then(m => m.transactionsRoutes), data: {preload: false} },
      { path: '**', pathMatch: 'full', component: NotFoundComponent }
    ]
  }
];

export const routes: Routes = [
  { path: 'status', loadChildren: () => import('./+status/status.routes').then(m => m.statusRoutes), data: {preload: false} },
  { path: '', component: BaseComponent, children: baseRoutes }
];

if (!environment.production) {
  routes.unshift({ path: 'pdf-demo', canActivate: [OnlyLoggedInGuard], loadChildren: () => import('./+pdf-demo/pdf-demo.routes').then(m => m.pdfDemoRoutes), data: {preload: false} });
}
