import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routing } from './user.routes';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    routing,
    RouterModule,
    CommonModule,
    NgbAlertModule
  ],
  declarations: [LoginComponent, LogoutComponent]
})
export class UserModule {}
