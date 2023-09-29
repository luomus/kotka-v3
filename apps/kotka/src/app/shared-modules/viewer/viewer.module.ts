import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ViewerComponent } from './viewer/viewer.component';

@NgModule({
  declarations: [ViewerComponent],
  imports: [CommonModule, SharedModule],
  exports: [ViewerComponent],
})
export class ViewerModule {}
