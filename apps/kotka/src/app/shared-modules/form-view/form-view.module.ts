import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormViewComponent } from './form-view/form-view.component';
import { KotkaUiMainContentModule } from '../../../../../../libs/kotka/ui/main-content/src';
import { KotkaUiLajiFormModule } from '../../../../../../libs/kotka/ui/laji-form/src';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [FormViewComponent],
  imports: [
    CommonModule,
    SharedModule,
    KotkaUiMainContentModule,
    KotkaUiLajiFormModule
  ],
  exports: [
    FormViewComponent
  ]
})
export class FormViewModule {}