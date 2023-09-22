import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LajiFormComponent } from './laji-form/laji-form.component';
import { FormFooterComponent } from './form-footer/form-footer.component';
import { LajiFormComponentEmbedderService } from './service/laji-form-component-embedder.service';
import { LajiFormEventListenerEmbedderService } from './service/laji-form-event-listener-embedder.service';

@NgModule({
  imports: [CommonModule],
  declarations: [LajiFormComponent, FormFooterComponent],
  exports: [LajiFormComponent],
  providers: [LajiFormComponentEmbedderService, LajiFormEventListenerEmbedderService]
})
export class KotkaUiLajiFormModule {}
