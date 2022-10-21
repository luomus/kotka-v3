import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routing } from './datasets.routes';
import { DatasetsComponent } from './datasets.component';
import { KotkaUiMainContentModule } from '../../../../../libs/kotka/ui/main-content/src';
import { KotkaUiDatatableModule } from '../../../../../libs/kotka/ui/datatable/src';

@NgModule({
  imports: [
    routing,
    RouterModule,
    KotkaUiMainContentModule,
    KotkaUiDatatableModule
  ],
  declarations: [
    DatasetsComponent
  ]
})
export class DatasetsModule {}
