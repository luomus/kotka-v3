import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppComponent } from './components/app/app.component';
import { NavComponent } from './components/nav/nav.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { KotkaUiSpinnerModule } from '@kotka/ui/spinner';
import { ToasterComponent } from './components/toaster/toaster.component';
import { NgbToastModule, NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { LabelPipe } from './pipes/label.pipe';
import { OldKotkaUrlPipe } from './pipes/old-kotka-url.pipe';
import { KotkaUiMainContentModule } from '@kotka/ui/main-content';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal';
import { BaseComponent } from './components/base/base.component';
import { ReversePipe } from './pipes/reverse.pipe';
import { ToFullUriPipe } from './pipes/to-full-uri.pipe';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbToastModule,
    NgbCollapseModule,
    NgbDropdownModule,
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
    BaseComponent,
    ToFullUriPipe
  ],
  exports: [KotkaUiSpinnerModule, LabelPipe, OldKotkaUrlPipe, ReversePipe, ToFullUriPipe],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [DatePipe],
    };
  }
}
