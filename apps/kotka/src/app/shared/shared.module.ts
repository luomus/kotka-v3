import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { AppComponent } from './components/app/app.component';
import { NavComponent } from './components/nav/nav.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { KotkaUiSpinnerModule } from '../../../../../libs/kotka/ui/spinner/src';
import { ToasterComponent } from './components/toaster/toaster.component';
import { ToastComponent } from './components/toaster/toast/toast.component';

@NgModule({
  imports: [CommonModule, RouterModule, CollapseModule, BsDropdownModule],
  declarations: [
    AppComponent,
    NavComponent,
    NotFoundComponent,
    ToasterComponent,
    ToastComponent,
  ],
  exports: [KotkaUiSpinnerModule],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [],
    };
  }
}
