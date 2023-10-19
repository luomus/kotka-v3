import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { AppComponent } from './components/app/app.component';
import { NavComponent } from './components/nav/nav.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { KotkaUiSpinnerModule } from '@kotka/ui/spinner';
import { ToasterComponent } from './components/toaster/toaster.component';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { LabelPipe } from './pipes/label.pipe';
import { OldKotkaUrlPipe } from './pipes/old-kotka-url.pipe';
import { KotkaUiMainContentModule } from '@kotka/ui/main-content';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal';
import { BaseComponent } from './components/base/base.component';
import { ReversePipe } from './pipes/reverse.pipe';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    CollapseModule,
    BsDropdownModule,
    NgbToastModule,
    KotkaUiMainContentModule,
  ],
  declarations: [
    AppComponent,
    NavComponent,
    NotFoundComponent,
    ToasterComponent,
    LabelPipe,
    OldKotkaUrlPipe,
    ReversePipe,
    ConfirmModalComponent,
    BaseComponent
  ],
  exports: [KotkaUiSpinnerModule, LabelPipe, OldKotkaUrlPipe, ReversePipe],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [DatePipe],
    };
  }
}
