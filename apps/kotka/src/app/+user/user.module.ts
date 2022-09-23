import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routing } from './user.routes';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';

@NgModule({
  imports: [
    routing,
    RouterModule
  ],
  declarations: [LoginComponent, LogoutComponent]
})
export class UserModule {}
