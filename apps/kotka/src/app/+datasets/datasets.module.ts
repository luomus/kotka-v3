import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routing } from './datasets.routes';
import { DatasetTableComponent } from './dataset-table/dataset-table.component';
import { KotkaUiMainContentModule } from '@kotka/ui/main-content';
import { KotkaUiDatatableModule } from '@kotka/ui/datatable';
import { DatasetFormComponent } from './dataset-form/dataset-form.component';
import { FormViewModule } from '../shared-modules/form-view/form-view.module';
import { SharedModule } from '../shared/shared.module';
import { DatasetVersionHistoryComponent } from './dataset-version-history/dataset-version-history.component';

@NgModule({
  imports: [
    routing,
    RouterModule,
    CommonModule,
    SharedModule,
    KotkaUiMainContentModule,
    KotkaUiDatatableModule,
    FormViewModule
  ],
  declarations: [DatasetTableComponent, DatasetFormComponent, DatasetVersionHistoryComponent],
})
export class DatasetsModule {}
