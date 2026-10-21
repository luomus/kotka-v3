import { Component, computed, effect, inject, Injector, input, model, OnDestroy, signal, Signal } from '@angular/core';
import {
  ColDef as AgGridColDef,
  DragStoppedEvent,
  GridApi,
  GridOptions,
  Module,
  ModuleRegistry
} from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import {
  ColDef,
  ColDefWithExtra,
  ColumnSettings,
  DatatableColumn,
  DatatableFilter,
  DatatableSort,
  DatatableSource,
  GetRowsParams
} from '../models/models';
import { forkJoin, from, Observable, Subject, takeUntil } from 'rxjs';
import { ColumnSettingsModalComponent } from '../column-settings-modal/column-settings-modal.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatatableExportService } from '../services/datatable-export.service';
import { CustomDatepickerComponent } from '../components/custom-datepicker.component';
import { CellRendererComponent } from '../renderers/cell-renderer';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { TotalCountComponent } from '../total-count/total-count.component';
import { SpinnerComponent } from '@kotka/ui/components';
import { AgGridAngular } from '@ag-grid-community/angular';
import {
  getDefaultColumnSettings,
  getOrderAfterColumnMove,
  getProcessedColumns,
  getVisibleColDefs
} from '../services/datatable-column-utils';
import { DatatableSettingsStoreService } from '../services/datatable-settings-store.service';
import { DialogService, Logger } from '@kotka/ui/core';
import { isEqual } from 'lodash';

ModuleRegistry.registerModules([
  CsvExportModule,
  InfiniteRowModelModule,
  ClientSideRowModelModule,
]);

interface GridReadyEvent {
  type: string;
  api: GridApi;
}

@Component({
  selector: 'kui-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  imports: [TotalCountComponent, SpinnerComponent, AgGridAngular]
})
export class DatatableComponent implements OnDestroy {
  private modalService = inject(NgbModal);
  private datatableExportService = inject(DatatableExportService);
  private settingsStoreService = inject(DatatableSettingsStoreService);
  private injector = inject(Injector);
  private logger = inject(Logger);
  private dialogService = inject(DialogService);

  columns = input<DatatableColumn[] | undefined>(undefined);
  columnsLoading = input<boolean>(false);
  datasource = input<DatatableSource>();

  enableFileExport = input<boolean | undefined>(false);
  enableColumnSelection = input<boolean | undefined>(false);
  disableFilter = input<boolean | undefined>(false);

  settingsKey = input.required<string>();
  columnSettings = model<ColumnSettings | undefined>(undefined);
  filterModel = model<DatatableFilter | undefined>(undefined);
  sortModel = model<DatatableSort | undefined>(undefined);

  dataTypeName = input('item');
  dataTypeNamePlural = input<string>();

  defaultFilterModel = input<DatatableFilter>({});
  defaultSortModel = input<DatatableSort>([]);

  loading: Signal<boolean>;
  colDefs: Signal<ColDef[] | undefined>;
  defaultColDef: Signal<AgGridColDef>;

  totalCount = signal<number | undefined>(undefined);
  exportLoading = signal(false);

  gridOptions: GridOptions = {
    rowGroupPanelShow: 'always',
    enableBrowserTooltips: true,
    enableCellTextSelection: true,
    rowBuffer: 0,
    rowModelType: 'infinite',
    cacheOverflowSize: 2,
    maxConcurrentDatasourceRequests: 1,
    infiniteInitialRowCount: 1,
    maxBlocksInCache: 10
  };
  modules: Module[] = [InfiniteRowModelModule];
  components: Record<string, any> = {
    agDateInput: CustomDatepickerComponent,
  };

  private hasColDefs: Signal<boolean>;
  private allColumns: Signal<ColDefWithExtra[] | undefined>;
  private defaultColumnSettings: Signal<ColumnSettings | undefined>;

  private gridDataSource: Signal<DatatableSource | undefined>;
  private dataLoading = signal(false);

  private gridApi = signal<GridApi | undefined>(undefined);
  private modalRef?: NgbModalRef;
  private isDestroyed = false;
  private unsubscribe$ = new Subject<void>();

  constructor() {
    this.loading = computed(() => (
      this.dataLoading() || this.columnsLoading()
    ));

    this.colDefs = computed(() => (
      getVisibleColDefs(this.allColumns(), this.columnSettings()))
    );

    this.defaultColDef = computed(() => ({
      flex: 1,
      resizable: true,
      minWidth: 120,
      sortable: true,
      filter: !this.disableFilter(),
      floatingFilter: !this.disableFilter(),
      suppressHeaderMenuButton: true,
      lockVisible: !this.enableColumnSelection()
    }));

    this.allColumns = computed(() => (
      getProcessedColumns(this.columns()))
    );

    this.defaultColumnSettings = computed(() => (
      getDefaultColumnSettings(this.allColumns(), this.enableColumnSelection()))
    );

    this.hasColDefs = computed(() => (this.colDefs() !== undefined));

    this.gridDataSource = computed(() => (
      this.hasColDefs() && this.datasource()
        ? { ...this.datasource(), getRows: this.getRows.bind(this) }
        : undefined
    ));

    this.initEffects();
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.modalRef?.close();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi.set(params.api);
  }

  onFilterChanged() {
    const newFilterModel = this.gridApi()?.getFilterModel();
    if (!isEqual(newFilterModel, this.filterModel())) {
      this.filterModel.set(newFilterModel);
    }
  }

  onSortChanged() {
    const newSort = this.gridApi()?.getColumnState()
      .filter((col) => !!col.sort)
      .map((col) => ({ colId: col.colId, sort: col.sort! }));

    if (!isEqual(newSort, this.sortModel())) {
      this.sortModel.set(newSort);
    }
  }

  onDragStopped(e: DragStoppedEvent) {
    const colId = e.target.attributes.getNamedItem('col-id')?.value;
    if (!colId) {
      return;
    }

    const currentVisible = this.getVisibleCols();

    this.columnSettings.update(columnSettings => (columnSettings ? {
      selected: currentVisible,
      order: getOrderAfterColumnMove(columnSettings.order, columnSettings.selected, currentVisible, colId)
    } : undefined));
  }

  openColumnSettingsModal() {
    const allColumns = this.allColumns();
    const columnSettings = this.columnSettings();
    const defaultColumnSettings = this.defaultColumnSettings();

    if (!allColumns || !columnSettings || !defaultColumnSettings) {
      return;
    }

    this.modalRef = this.modalService.open(ColumnSettingsModalComponent, {
      backdrop: 'static',
      size: 'md',
      modalDialogClass: 'scrollable-modal column-settings-modal',
    });

    this.modalRef.componentInstance.columns.set(allColumns);
    this.modalRef.componentInstance.settings.set(columnSettings);
    this.modalRef.componentInstance.defaultSettings.set(defaultColumnSettings);

    from(this.modalRef.result).subscribe({
      next: (settings) => {
        this.columnSettings.set(settings);
      },
      error: () => undefined,
    });
  }

  exportData() {
    const colDefs = this.colDefs();
    const datasource = this.datasource();
    const totalCount = this.totalCount();
    const sortModel = this.sortModel();
    const filterModel = this.filterModel();

    if (!colDefs || !datasource || totalCount === undefined || !sortModel || !filterModel) {
      return;
    }

    this.exportLoading.set(true);
    this.datatableExportService
      .exportData(
        colDefs,
        datasource,
        totalCount,
        sortModel,
        filterModel,
      )
      .subscribe({
        next: () => {
          this.exportLoading.set(false);
        },
        error: (e) => {
          this.logger.error('Datatable export failed', e);
          this.dialogService.alert('An unexpected error occurred.');
          this.exportLoading.set(false);
        },
      });
  }

  private initEffects() {
    effect(() => {
      this.gridApi()?.setGridOption('columnDefs', this.colDefs());
    });

    effect(() => {
      this.gridApi()?.setGridOption('defaultColDef', this.defaultColDef());
    });

    effect(() => {
      this.gridApi()?.setFilterModel(this.filterModel() || null);
    });

    effect(() => {
      this.gridApi()?.applyColumnState({
        state: this.sortModel(),
        defaultState: { sort: null }
      });
    });

    effect(() => {
      this.gridApi()?.setGridOption('loading', this.loading());
    });

    effect(() => {
      this.gridApi()?.setGridOption('datasource', this.gridDataSource());
    });

    effect(() => {
      if (this.columnSettings()) {
        return;
      }

      let storedSettings: ColumnSettings | undefined;
      if (this.enableColumnSelection()) {
        storedSettings = this.settingsStoreService.getStoredColumnSettings(
          this.settingsKey(),
          this.defaultColumnSettings()
        );
      }

      this.columnSettings.set(storedSettings || this.defaultColumnSettings());
    });

    effect(() => {
      if (this.filterModel()) {
        return;
      }

      const filterModel = {
        ...this.defaultFilterModel(),
        ...this.settingsStoreService.getStoredFilters(this.settingsKey())
      };
      this.filterModel.set(filterModel);
    });

    effect(() => {
      if (this.sortModel()) {
        return;
      }

      this.sortModel.set(this.defaultSortModel());
    });

    effect(() => {
      if (this.enableColumnSelection()) {
        this.settingsStoreService.storeColumnSettings(
          this.settingsKey(),
          this.columnSettings()
        );
      }
    });

    effect(() => {
      this.settingsStoreService.storeFilters(
        this.settingsKey(),
        this.filterModel(),
        this.allColumns()
      );
    });
  }

  private getRows(params: GetRowsParams) {
    if (this.isDestroyed) {
      return;
    }

    this.beforeFetchRows();

    const successCallback = (results: unknown[], totalItems: number) => {
      if (this.isDestroyed) {
        return;
      }

      this.afterFetchRows(results, totalItems);

      params.successCallback(results, totalItems);
    };

    this.datasource()?.getRows({ ...params, successCallback });
  }

  private beforeFetchRows() {
    this.totalCount.set(undefined);
    this.dataLoading.set(true);
  }

  private afterFetchRows(results: unknown[], totalItems: number) {
    this.loadCellRendererDataToCache(results);

    this.totalCount.set(totalItems);
    this.dataLoading.set(false);
  }

  private loadCellRendererDataToCache(rowData: unknown[]) {
    const observables: Observable<unknown>[] = [];

    this.colDefs()?.forEach((col) => {
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
      forkJoin(observables).pipe(takeUntil(this.unsubscribe$)).subscribe();
    }
  }

  private getVisibleCols(): string[] {
    const gridApi = this.gridApi();
    if (!gridApi) {
      return [];
    }
    return gridApi
      .getAllDisplayedColumns()
      .map((c) => c.getColId());
  }
}
