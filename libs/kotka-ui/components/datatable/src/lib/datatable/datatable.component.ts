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
  ColDef,
  GridApi,
  GridOptions,
  Module, ModuleRegistry,
  RowModelType, RowSelectionOptions
} from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import {
  CustomColDef,
  DatatableColumn, DatatableColumnWithId,
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

ModuleRegistry.registerModules([
  CsvExportModule,
  InfiniteRowModelModule,
  ClientSideRowModelModule,
]);

type CustomColumnKeyList = TupleUnion<keyof CustomColDef>;

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
  @Input() columns: DatatableColumn[] = [];

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
  defaultColDef: ColDef = {
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

  private allColumns: DatatableColumnWithId[] = [];

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
    if (
      changes['columns'] ||
      changes['enableColumnSelection'] ||
      changes['settingsKey']
    ) {
      this.updateColumns();
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

  columnUpdated() {
    if (!this.gridApi) {
      return;
    }

    if (this.enableColumnSelection) {
      const selected = this.gridApi
        .getAllDisplayedColumns()
        .map((c) => c.getColId());

      this.datatableColumnSettingsService.updateSelected(
        this.settingsKey,
        selected,
      );
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
      selected: this.getDefaultSelectedColumns(),
    };

    from(modalRef.result).subscribe({
      next: (settings) => {
        this.datatableColumnSettingsService.setSettings(
          this.settingsKey,
          settings,
        );
        this.updateColumns();
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
        this.getVisibleColumns(),
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

  private updateColumns() {
    this.allColumns = this.processColumns(this.columns);

    let columns = this.allColumns;
    if (this.enableColumnSelection) {
      this.datatableColumnSettingsService.cleanSettings(
        this.settingsKey,
        this.allColumns,
      );
      columns = this.filterAndSortColumns(columns);
    }

    this.colDefs = this.removeCustomColumnKeys(columns);
  }

  private processColumns(columns: DatatableColumn[]): DatatableColumnWithId[] {
    return columns.map((col) => {
      const colId = col.colId || col.field;
      if (!colId) {
        throw Error('Every column should either have colId or field');
      }
      const newCol: DatatableColumnWithId = { ...col, colId };

      if (!col.hideDefaultHeaderTooltip) {
        newCol.headerTooltip = col.headerName;
      }
      if (!col.cellRenderer) {
        newCol.tooltipField = col.field;
      }

      return newCol;
    });
  }

  private filterAndSortColumns(columns: DatatableColumnWithId[]): DatatableColumnWithId[] {
    const settings = this.datatableColumnSettingsService.getSettings(
      this.settingsKey,
    );
    const selected = settings.selected
      ? settings.selected
      : this.getDefaultSelectedColumns();

    columns = columns.map((col) => ({
      ...col,
      hide: !selected.includes(col.colId),
    }));
    columns.sort(
      (columnA, columnB) =>
        selected.indexOf(columnA.colId) - selected.indexOf(columnB.colId),
    );

    return columns;
  }

  private removeCustomColumnKeys(columns: DatatableColumn[]): ColDef[] {
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

  private getDefaultSelectedColumns(): string[] {
    return this.allColumns
      .filter((col) => col.defaultSelected)
      .map((col) => col.colId);
  }

  private getVisibleColumns(): DatatableColumnWithId[] {
    if (this.gridApi) {
      const columnByIdMap = this.allColumns.reduce((res, col) => {
        res[col.colId] = col;
        return res;
      }, {} as Record<string, DatatableColumnWithId>);

      const selected = this.gridApi.getAllDisplayedColumns().map(c => c.getColId());

      return selected.map(id => columnByIdMap[id]);
    } else {
      return this.allColumns.filter(col => !col.hide);
    }
  }
}
