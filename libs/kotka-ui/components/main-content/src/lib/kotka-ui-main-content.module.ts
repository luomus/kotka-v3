import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainContentComponent } from './main-content/main-content.component';

@NgModule({
  imports: [CommonModule],
  declarations: [MainContentComponent],
  exports: [MainContentComponent],
})
export class KotkaUiMainContentModule {}
