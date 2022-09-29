import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routing } from './datasets.routes';
import { DatasetsComponent } from './datasets.component';
import { KotkaUiMainContentModule } from '../../../../../libs/kotka/ui/main-content/src';
import { KotkaUiDatatableModule } from '../../../../../libs/kotka/ui/datatable/src';
import { DatasetFormComponent } from './dataset-form/dataset-form.component';
import { KotkaUiLajiFormModule } from '../../../../../libs/kotka/ui/laji-form/src';

@NgModule({
  imports: [
    routing,
    RouterModule,
    CommonModule,
    KotkaUiMainContentModule,
    KotkaUiDatatableModule,
    KotkaUiLajiFormModule
  ],
  declarations: [DatasetsComponent, DatasetFormComponent],
})
export class DatasetsModule {}
