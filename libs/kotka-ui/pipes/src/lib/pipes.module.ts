import { NgModule } from '@angular/core';
import { LabelPipe } from './label.pipe';
import { ReversePipe } from './reverse.pipe';
import { ToFullUriPipe } from './to-full-uri.pipe';
import { EnumPipe } from './enum-pipe';
import { CapitalizeFirstLetterPipe } from './capitalize-first-letter-pipe';
import { JoinPipe } from './join.pipe';

@NgModule({
  imports: [],
  declarations: [
    LabelPipe,
    ReversePipe,
    ToFullUriPipe,
    EnumPipe,
    CapitalizeFirstLetterPipe,
    JoinPipe,
  ],
  exports: [
    LabelPipe,
    ReversePipe,
    ToFullUriPipe,
    EnumPipe,
    CapitalizeFirstLetterPipe,
    JoinPipe,
  ],
})
export class PipesModule {}
