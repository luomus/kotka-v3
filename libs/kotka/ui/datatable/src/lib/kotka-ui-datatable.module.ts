import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatatableComponent } from './datatable/datatable.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ModuleRegistry } from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import { URICellRendererComponent } from './renderers/uri-cell-renderer.component';

ModuleRegistry.registerModules([CsvExportModule, InfiniteRowModelModule]);

@NgModule({
  imports: [
    CommonModule,
    AgGridModule,
    RouterModule
  ],
  exports: [
    DatatableComponent,
  ],
  declarations: [DatatableComponent, URICellRendererComponent],
})
export class KotkaUiDatatableModule {}
