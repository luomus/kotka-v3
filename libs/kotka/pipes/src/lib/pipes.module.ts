import { NgModule } from '@angular/core';
import { LabelPipe } from './label.pipe';
import { ReversePipe } from './reverse.pipe';
import { ToFullUriPipe } from './to-full-uri.pipe';
import { EnumPipe } from './enum-pipe';
import { CapitalizeFirstLetterPipe } from './capitalize-first-letter-pipe';

@NgModule({
  imports: [],
  declarations: [
    LabelPipe,
    ReversePipe,
    ToFullUriPipe,
    EnumPipe,
    CapitalizeFirstLetterPipe
  ],
  exports: [LabelPipe, ReversePipe, ToFullUriPipe, EnumPipe, CapitalizeFirstLetterPipe],
})
export class PipesModule {}
