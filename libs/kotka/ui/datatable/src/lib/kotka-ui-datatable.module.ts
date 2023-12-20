import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatatableComponent } from './datatable/datatable.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ModuleRegistry } from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import { URICellRendererComponent } from './renderers/uri-cell-renderer.component';
import { EnumCellRendererComponent } from './renderers/enum-cell-renderer.component';
import { PipesModule } from '@kotka/pipes';
import { LabelCellRendererComponent } from './renderers/label-cell-renderer.component';
import { YearCellRendererComponent } from './renderers/year-cell-renderer.component';

ModuleRegistry.registerModules([CsvExportModule, InfiniteRowModelModule]);

@NgModule({
  imports: [
    CommonModule,
    AgGridModule,
    RouterModule,
    PipesModule
  ],
  exports: [
    DatatableComponent,
  ],
  declarations: [
    DatatableComponent,
    URICellRendererComponent,
    EnumCellRendererComponent,
    LabelCellRendererComponent,
    YearCellRendererComponent
  ],
})
export class KotkaUiDatatableModule {}
