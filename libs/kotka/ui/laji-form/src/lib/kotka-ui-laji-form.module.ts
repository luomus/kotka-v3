import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LajiFormComponent } from './laji-form/laji-form.component';
import { FormFooterComponent } from './form-footer/form-footer.component';

@NgModule({
  imports: [CommonModule],
  declarations: [LajiFormComponent, FormFooterComponent],
  exports: [LajiFormComponent],
})
export class KotkaUiLajiFormModule {}
