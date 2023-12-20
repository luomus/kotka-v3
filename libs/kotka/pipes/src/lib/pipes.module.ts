import { NgModule } from '@angular/core';
import { LabelPipe } from './label.pipe';
import { ReversePipe } from './reverse.pipe';
import { ToFullUriPipe } from './to-full-uri.pipe';
import { EnumPipe } from './enum-pipe';

@NgModule({
  imports: [],
  declarations: [
    LabelPipe,
    ReversePipe,
    ToFullUriPipe,
    EnumPipe
  ],
  exports: [LabelPipe, ReversePipe, ToFullUriPipe, EnumPipe],
})
export class PipesModule {}
