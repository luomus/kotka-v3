import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatableComponent } from './datatable/datatable.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { AlertModule } from 'ngx-bootstrap/alert';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { AgGridModule } from '@ag-grid-community/angular';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ModuleRegistry } from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';

ModuleRegistry.registerModules([CsvExportModule, InfiniteRowModelModule]);

@NgModule({
  imports: [
    CommonModule,
    AlertModule,
    ButtonsModule,
    BsDatepickerModule,
    BsDropdownModule,
    CollapseModule,
    ModalModule,
    PopoverModule,
    TypeaheadModule,
    AgGridModule.withComponents([]),
  ],
  exports: [
    AlertModule,
    ButtonsModule,
    BsDatepickerModule,
    BsDropdownModule,
    CollapseModule,
    ModalModule,
    PopoverModule,
    TypeaheadModule,
    DatatableComponent,
  ],
  declarations: [DatatableComponent],
})
export class KotkaUiDatatableModule {}
