import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routing } from './datasets.routes';
import { DatasetsComponent } from './datasets.component';
import { KotkaUiMainContentModule } from '../../../../../libs/kotka/ui/main-content/src';
import { KotkaUiDatatableModule } from '../../../../../libs/kotka/ui/datatable/src';
import { DatasetFormComponent } from './dataset-form/dataset-form.component';
import { FormViewModule } from '../shared-modules/form-view/form-view.module';

@NgModule({
  imports: [
    routing,
    RouterModule,
    CommonModule,
    KotkaUiMainContentModule,
    KotkaUiDatatableModule,
    FormViewModule
  ],
  declarations: [DatasetsComponent, DatasetFormComponent],
})
export class DatasetsModule {}
