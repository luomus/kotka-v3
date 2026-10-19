import { Component, Injector, OnDestroy, input, computed, signal, Signal, effect, WritableSignal, inject, model } from '@angular/core';
import {
  ColDef as AgGridColDef,
  DragStoppedEvent,
  GridApi,
  GridOptions,
  Module,
  ModuleRegistry,
} from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import {
  ColDef,
  DatatableColumn,
  DatatableFilter,
  DatatableSort,
  DatatableSource,
  GetRowsParams,
  ColumnSettings,
  ColDefWithExtra
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
import { isEqual } from 'lodash';
import {
  getVisibleColDefs,
  getDefaultColumnSettings,
  getProcessedColumns,
  getOrderAfterColumnMove,
} from '../services/datatable-column-utils';
import { DatatableSettingsStoreService } from '../services/datatable-settings-store.service';
import { DialogService, Logger } from '@kotka/ui/core';

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

  columns = input<DatatableColumn[]>([]);
  columnsLoading = input<boolean|undefined>(false);
  datasource = input<DatatableSource>();

  enableFileExport = input<boolean|undefined>(false);
  enableColumnSelection = input<boolean|undefined>(false);
  disableFilter = input<boolean|undefined>(false);

  columnSettings = model<ColumnSettings | undefined>(undefined);
  settingsKey = input<string>();

  sortModel = model<DatatableSort>([]);

  dataTypeName = input('item');
  dataTypeNamePlural = input<string>();

  defaultFilterModel = input<DatatableFilter>({});

  colDefs: Signal<ColDef[]>;
  defaultColDef: Signal<AgGridColDef>;

  totalCount = signal<number|undefined>(undefined);
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

  private allColumns: Signal<ColDefWithExtra[]>;
  private defaultColumnSettings: Signal<ColumnSettings>;
  private activeColumnSettings: Signal<ColumnSettings>;

  private gridDataSource: Signal<DatatableSource|undefined>;
  private dataLoading = signal(false);

  private filterModel: WritableSignal<DatatableFilter> = signal({}, {equal: isEqual});

  private gridApi = signal<GridApi | undefined>(undefined);
  private modalRef?: NgbModalRef;
  private isDestroyed = false;
  private unsubscribe$ = new Subject<void>();

  constructor() {
    this.colDefs = computed(() => (
      getVisibleColDefs(this.allColumns(), this.activeColumnSettings()))
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

    this.activeColumnSettings = computed(() => (
      this.columnSettings() || this.defaultColumnSettings()
    ), {equal: isEqual});

    this.gridDataSource = computed(() => (
      this.datasource()
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

  dragStopped(e: DragStoppedEvent) {
    const colId = e.target.attributes.getNamedItem('col-id')?.value;
    if (!colId) {
      return;
    }

    const currentVisible = this.getVisibleCols();

    this.columnSettings.set({
      selected: currentVisible,
      order: getOrderAfterColumnMove(this.activeColumnSettings().order, this.activeColumnSettings().selected, currentVisible, colId)
    });
  }

  openColumnSettingsModal() {
    this.modalRef = this.modalService.open(ColumnSettingsModalComponent, {
      backdrop: 'static',
      size: 'md',
      modalDialogClass: 'scrollable-modal column-settings-modal',
    });

    this.modalRef.componentInstance.columns.set(this.allColumns());
    this.modalRef.componentInstance.settings.set(this.activeColumnSettings());
    this.modalRef.componentInstance.defaultSettings.set(this.defaultColumnSettings());

    from(this.modalRef.result).subscribe({
      next: (settings) => {
        this.columnSettings.set(settings);
      },
      error: () => undefined,
    });
  }

  exportData() {
    const datasource = this.datasource();
    const totalCount = this.totalCount();

    if (!datasource || totalCount === undefined) {
      return;
    }

    this.exportLoading.set(true);
    this.datatableExportService
      .exportData(
        this.colDefs(),
        datasource,
        totalCount,
        this.sortModel(),
        this.filterModel(),
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
      this.gridApi()?.applyColumnState({
        state: this.sortModel(),
        defaultState: { sort: null }
      });
    });

    effect(() => {
      this.gridApi()?.setGridOption('datasource', this.gridDataSource());
    });

    effect(() => {
      this.gridApi()?.setGridOption('loading', this.dataLoading());
    });

    effect(() => {
      if (this.columnSettings() || this.columnsLoading()) {
        return;
      }

      let storedSettings: ColumnSettings|undefined;
      if (this.enableColumnSelection()) {
        storedSettings = this.settingsStoreService.getStoredColumnSettings(
          this.settingsKey(),
          this.defaultColumnSettings()
        );
      }

      if (storedSettings) {
        this.columnSettings.set(storedSettings);
      }
    });

    effect(() => {
      if (this.enableColumnSelection() && !this.columnsLoading()) {
        this.settingsStoreService.storeColumnSettings(
          this.settingsKey(),
          this.columnSettings()
        );
      }
    });

    effect(() => {
      const filterModel = {
        ...this.defaultFilterModel(),
        ...this.settingsStoreService.getStoredFilters(this.settingsKey())
      };
      this.filterModel.set(filterModel);
      this.gridApi()?.setFilterModel(filterModel);
    });

    effect(() => {
      this.settingsStoreService.storeFilters(
        this.settingsKey(),
        this.filterModel(),
        this.allColumns(),
      );
    });
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

    this.datasource()?.getRows({ ...params, successCallback });
  }

  private beforeFetchRows(params: GetRowsParams) {
    this.sortModel.set(params.sortModel);
    this.filterModel.set(params.filterModel);

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

    this.colDefs().forEach((col) => {
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
