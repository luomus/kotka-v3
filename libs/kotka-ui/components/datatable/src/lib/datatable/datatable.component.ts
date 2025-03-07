import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ColDef as AgGridColDef,
  DragStoppedEvent,
  GridApi,
  GridOptions,
  Module, ModuleRegistry,
  RowModelType,
  RowSelectionOptions
} from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import {
  ColDef,
  ExtraColDef,
  DatatableColumn, ColDefWithExtra,
  DatatableFilter,
  DatatableSort,
  DatatableSource,
  GetRowsParams,
  TupleUnion
} from '../models/models';
import { forkJoin, from, Observable, Subscription } from 'rxjs';
import { ColumnSettingsModalComponent } from '../column-settings-modal/column-settings-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableExportService } from '../services/datatable-export.service';
import { CustomDatepickerComponent } from '../components/custom-datepicker.component';
import { CellRendererComponent } from '../renderers/cell-renderer';
import { DatatableColumnSettingsService } from '../services/datatable-column-settings.service';
import { DatatableFilterStoreService } from '../services/datatable-filter-store.service';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { TotalCountComponent } from '../total-count/total-count.component';
import { SpinnerComponent } from '@kotka/ui/spinner';
import { AgGridAngular } from '@ag-grid-community/angular';
import { CommonModule } from '@angular/common';
import { isEqual } from 'lodash';

ModuleRegistry.registerModules([
  CsvExportModule,
  InfiniteRowModelModule,
  ClientSideRowModelModule,
]);

type CustomColumnKeyList = TupleUnion<keyof ExtraColDef>;

interface GridReadyEvent {
  type: string;
  api: GridApi;
}

@Component({
  selector: 'kui-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  imports: [CommonModule, TotalCountComponent, SpinnerComponent, AgGridAngular],
})
export class DatatableComponent implements OnChanges, OnDestroy {
  @Input() set columns(columns: DatatableColumn[]) {
    this.allColumns = this.getProcessedColumns(columns);
    this.updateColDefs();
  }

  @Input() datasource?: DatatableSource;

  @Input() enableFileExport? = false;

  @Input() enableColumnSelection? = false;

  @Input() settingsKey?: string;

  @Input() dataTypeName = 'item';
  @Input() dataTypeNamePlural?: string;

  @Input() defaultFilterModel: DatatableFilter = {};

  @Output() rowClicked = new EventEmitter();

  totalCount?: number;

  exportLoading = false;

  modules: Module[] = [InfiniteRowModelModule];
  components: Record<string, any> = {
    agDateInput: CustomDatepickerComponent,
  };
  colDefs: ColDef[] = [];
  defaultColDef: AgGridColDef = {
    flex: 1,
    resizable: true,
    minWidth: 120,
    sortable: true,
    filter: true,
    floatingFilter: true,
    suppressHeaderMenuButton: true,
  };
  rowBuffer = 0;
  rowSelection?: RowSelectionOptions;
  rowModelType: RowModelType = 'infinite';
  paginationPageSize = 100;
  cacheOverflowSize = 2;
  maxConcurrentDatasourceRequests = 1;
  infiniteInitialRowCount = 1;
  maxBlocksInCache = 10;
  gridOptions: GridOptions = {
    rowGroupPanelShow: 'always',
    suppressFieldDotNotation: true,
  };

  private gridApi?: GridApi;
  private gridDataSource?: DatatableSource;

  private allColumns: ColDefWithExtra[] = [];

  private sortModel: DatatableSort = [];
  private filterModel: DatatableFilter = {};

  private isDestroyed = false;
  private loadCellRendererDataToCacheSub: Subscription = new Subscription();

  constructor(
    private modalService: NgbModal,
    private datatableExportService: DatatableExportService,
    private datatableColumnSettingsService: DatatableColumnSettingsService,
    private datatableFilterStoreService: DatatableFilterStoreService,
    private injector: Injector,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['enableColumnSelection'] || changes['settingsKey']) {
      this.defaultColDef.lockVisible = !this.enableColumnSelection;
      this.updateColDefs();
    }

    if (changes['defaultFilterModel'] || changes['settingsKey']) {
      this.filterModel = {
        ...this.defaultFilterModel,
        ...this.datatableFilterStoreService.getFilters(this.settingsKey)
      };
      this.gridApi?.setFilterModel(this.filterModel);
    }

    if (changes['datasource']) {
      this.gridDataSource = this.datasource
        ? { ...this.datasource, getRows: this.getRows.bind(this) }
        : undefined;
      this.gridApi?.setGridOption('datasource', this.gridDataSource);
    }
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.loadCellRendererDataToCacheSub.unsubscribe();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setFilterModel(this.filterModel);
    this.gridApi.setGridOption('datasource', this.gridDataSource);
  }

  dragStopped(e: DragStoppedEvent) {
    if (!this.gridApi) {
      return;
    }

    const colId = e.target.attributes.getNamedItem('col-id')?.value;
    if (!colId) {
      return;
    }

    if (this.enableColumnSelection) {
      const prevSelected = this.colDefs.map((col: ColDef) => (col.colId));
      const currentSelected = this.getVisibleCols();

      if (!isEqual(prevSelected, currentSelected)) {
        this.datatableColumnSettingsService.updateSelectedAfterColumnMove(this.settingsKey, currentSelected, colId);

        if (!isEqual(prevSelected.sort(), currentSelected.sort())) {
          this.updateColDefs();
        }
      }
    }
  }

  openColumnSettingsModal() {
    const modalRef = this.modalService.open(ColumnSettingsModalComponent, {
      backdrop: 'static',
      size: 'md',
      modalDialogClass: 'column-settings-modal',
    });

    modalRef.componentInstance.columns = this.allColumns;
    modalRef.componentInstance.settings =
      this.datatableColumnSettingsService.getSettings(this.settingsKey);
    modalRef.componentInstance.defaultSettings = {
      selected: this.getDefaultSelectedCols(),
    };

    from(modalRef.result).subscribe({
      next: (settings) => {
        this.datatableColumnSettingsService.setSettings(
          this.settingsKey,
          settings,
        );
        this.updateColDefs();
        this.cdr.markForCheck();
      },
      error: () => undefined,
    });
  }

  exportData() {
    if (!this.datasource || !this.totalCount) {
      return;
    }

    this.exportLoading = true;
    this.datatableExportService
      .exportData(
        this.colDefs,
        this.datasource,
        this.totalCount,
        this.sortModel,
        this.filterModel,
      )
      .subscribe({
        next: () => {
          this.exportLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.exportLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  refresh() {
    this.gridApi?.refreshInfiniteCache();
  }

  private getRows(params: GetRowsParams) {
    if (this.isDestroyed) {
      return;
    }

    this.beforeFetchRows(params);

    const successCallback = (results: unknown[], totalItems: number) => {
      if (this.isDestroyed) {
        return;
      }

      this.afterFetchRows(results, totalItems);

      params.successCallback(results, totalItems);
    };

    this.datasource?.getRows({ ...params, successCallback });
  }

  private beforeFetchRows(params: GetRowsParams) {
    this.sortModel = params.sortModel;
    this.filterModel = params.filterModel;
    this.datatableFilterStoreService.updateFilters(
      this.settingsKey,
      this.filterModel,
      this.allColumns,
    );

    this.updateTotalCount(undefined);
    this.updateLoading(true);
  }

  private afterFetchRows(results: unknown[], totalItems: number) {
    this.loadCellRendererDataToCache(results);

    this.updateTotalCount(totalItems);
    this.updateLoading(false);
  }

  private updateTotalCount(totalCount: number | undefined) {
    this.ngZone.run(() => {
      this.totalCount = totalCount;
      this.cdr.markForCheck();
    });
  }

  private updateLoading(loading: boolean) {
    if (!this.gridApi) {
      return;
    }
    this.gridApi.setGridOption('loading', loading);
  }

  private loadCellRendererDataToCache(rowData: unknown[]) {
    const observables: Observable<unknown>[] = [];

    this.colDefs.forEach((col) => {
      if (col.cellRenderer) {
        observables.push(
          (col.cellRenderer as typeof CellRendererComponent).fetchDataToCache(
            col,
            rowData,
            this.injector,
          ),
        );
      }
    });

    if (observables.length > 0) {
      this.loadCellRendererDataToCacheSub.add(
        forkJoin(observables).subscribe(),
      );
    }
  }

  private getProcessedColumns(columns: DatatableColumn[]): ColDefWithExtra[] {
    return columns.map((col) => {
      const colId = col.colId || col.field;
      if (!colId) {
        throw Error('Every column should either have colId or field');
      }
      const newCol: ColDefWithExtra = { ...col, colId };

      if (!col.hideDefaultHeaderTooltip) {
        newCol.headerTooltip = col.headerName;
      }
      if (!col.cellRenderer) {
        newCol.tooltipField = col.field;
      }

      return newCol;
    });
  }

  private updateColDefs() {
    this.colDefs = this.getColDefsFromColumns(this.allColumns);
  }

  private getColDefsFromColumns(columns: ColDefWithExtra[]): ColDef[] {
    if (this.enableColumnSelection) {
      this.datatableColumnSettingsService.cleanSettings(
        this.settingsKey,
        this.allColumns,
      );
      columns = this.filterAndSortColumns(columns);
    }
    return this.removeCustomColumnKeys(columns);
  }

  private filterAndSortColumns(columns: ColDefWithExtra[]): ColDefWithExtra[] {
    const settings = this.datatableColumnSettingsService.getSettings(
      this.settingsKey,
    );
    const selected = settings.selected
      ? settings.selected
      : this.getDefaultSelectedCols();

    columns = columns.filter(col => (selected.includes(col.colId)));
    columns.sort(
      (columnA, columnB) =>
        selected.indexOf(columnA.colId) - selected.indexOf(columnB.colId),
    );

    return columns;
  }

  private removeCustomColumnKeys(columns: ColDefWithExtra[]): ColDef[] {
    return columns.map((col) => {
      col = { ...col };

      const customKeys: CustomColumnKeyList = [
        'hideDefaultHeaderTooltip',
        'hideDefaultTooltip',
        'defaultSelected',
        'rememberFilters',
      ];
      for (const key of customKeys) {
        delete col[key];
      }

      return col;
    });
  }

  private getDefaultSelectedCols(): string[] {
    return this.allColumns
      .filter((col) => col.defaultSelected)
      .map((col) => col.colId);
  }

  private getVisibleCols(): string[] {
    if (!this.gridApi) {
      return [];
    }
    return this.gridApi
      .getAllDisplayedColumns()
      .map((c) => c.getColId());
  }
}
