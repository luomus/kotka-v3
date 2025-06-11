import {
  Component,
  Injector,
  OnDestroy,
  input,
  computed,
  signal,
  Signal,
  effect,
  WritableSignal
} from '@angular/core';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableExportService } from '../services/datatable-export.service';
import { CustomDatepickerComponent } from '../components/custom-datepicker.component';
import { CellRendererComponent } from '../renderers/cell-renderer';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { TotalCountComponent } from '../total-count/total-count.component';
import { SpinnerComponent } from '@kotka/ui/spinner';
import { AgGridAngular } from '@ag-grid-community/angular';
import { isEqual } from 'lodash';
import {
  getVisibleColDefs,
  getDefaultColumnSettings,
  getProcessedColumns,
  getColumnSettingsAfterColumnMove
} from '../services/datatable-column-utils';
import { DatatableSettingsStoreService } from '../services/datatable-settings-store.service';
import { DialogService, Logger } from '@kotka/ui/services';

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
  columns = input<DatatableColumn[]>([]);
  datasource = input<DatatableSource>();

  enableFileExport = input<boolean|undefined>(false);
  enableColumnSelection = input<boolean|undefined>(false);

  settingsKey = input<string>();

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
  private columnSettings: WritableSignal<ColumnSettings> = signal({ selected: [], order: []}, {equal: isEqual});

  private gridDataSource: Signal<DatatableSource|undefined>;

  private sortModel: WritableSignal<DatatableSort> = signal([], {equal: isEqual});
  private filterModel: WritableSignal<DatatableFilter> = signal({}, {equal: isEqual});

  private gridApi?: GridApi;
  private isDestroyed = false;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private datatableExportService: DatatableExportService,
    private settingsStoreService: DatatableSettingsStoreService,
    private injector: Injector,
    private logger: Logger,
    private dialogService: DialogService,
  ) {
    this.colDefs = computed(() => (
      getVisibleColDefs(this.allColumns(), this.columnSettings()))
    );

    this.defaultColDef = computed(() => ({
      flex: 1,
      resizable: true,
      minWidth: 120,
      sortable: true,
      filter: true,
      floatingFilter: true,
      suppressHeaderMenuButton: true,
      lockVisible: !this.enableColumnSelection()
    }));

    this.allColumns = computed(() => (
      getProcessedColumns(this.columns()))
    );

    this.defaultColumnSettings = computed(() => (
      getDefaultColumnSettings(this.allColumns(), this.enableColumnSelection()))
    );

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
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setFilterModel(this.filterModel());
    this.gridApi.setGridOption('datasource', this.gridDataSource());
  }

  dragStopped(e: DragStoppedEvent) {
    if (!this.gridApi) {
      return;
    }

    const colId = e.target.attributes.getNamedItem('col-id')?.value;
    if (!colId) {
      return;
    }

    const currentVisible = this.getVisibleCols();

    this.columnSettings.set(
      getColumnSettingsAfterColumnMove(this.columnSettings(), currentVisible, colId)
    );
  }

  openColumnSettingsModal() {
    const modalRef = this.modalService.open(ColumnSettingsModalComponent, {
      backdrop: 'static',
      size: 'md',
      modalDialogClass: 'column-settings-modal',
    });

    modalRef.componentInstance.columns = this.allColumns();
    modalRef.componentInstance.settings = this.columnSettings();
    modalRef.componentInstance.defaultSettings = this.defaultColumnSettings();

    from(modalRef.result).subscribe({
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

  refresh() {
    this.gridApi?.refreshInfiniteCache();
  }

  private initEffects() {
    effect(() => {
      const defaultSettings = this.defaultColumnSettings();

      let storedSettings: ColumnSettings|undefined;
      if (this.enableColumnSelection()) {
        storedSettings = this.settingsStoreService.getStoredColumnSettings(
          this.settingsKey(),
          defaultSettings
        );
      }

      this.columnSettings.set(storedSettings || defaultSettings);
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
      this.filterModel.set({
        ...this.defaultFilterModel(),
        ...this.settingsStoreService.getStoredFilters(this.settingsKey())
      });
      this.gridApi?.setFilterModel(this.filterModel);
    });

    effect(() => {
      this.settingsStoreService.storeFilters(
        this.settingsKey(),
        this.filterModel(),
        this.allColumns(),
      );
    });

    effect(() => {
      this.gridApi?.setGridOption('datasource', this.gridDataSource());
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
    this.updateLoading(true);
  }

  private afterFetchRows(results: unknown[], totalItems: number) {
    this.loadCellRendererDataToCache(results);

    this.totalCount.set(totalItems);
    this.updateLoading(false);
  }

  private updateLoading(loading: boolean) {
    this.gridApi?.setGridOption('loading', loading);
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
    if (!this.gridApi) {
      return [];
    }
    return this.gridApi
      .getAllDisplayedColumns()
      .map((c) => c.getColId());
  }
}
