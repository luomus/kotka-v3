import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { HttpClientModule } from '@angular/common/http';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { NavComponent } from './components/nav/nav.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { LoginComponent } from './components/login/login.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { LogoutComponent } from './components/logout/logout.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: NotFoundComponent },
  { path: 'user/login', pathMatch: 'full', component: LoginComponent },
  { path: 'user/logout', pathMatch: 'full', component: LogoutComponent}
];

@NgModule({
  declarations: [AppComponent, NavComponent, NxWelcomeComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    HttpClientModule,
    CollapseModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
