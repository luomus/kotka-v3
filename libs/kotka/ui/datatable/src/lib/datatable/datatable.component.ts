import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import {
  ColDef,
  ColumnApi,
  GridApi,
  GridOptions,
  Module,
  RowModelType
} from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import {
  ColumnSettings,
  DatatableColumn,
  DatatableSource, FilterModel,
  GetRowsParams, SortModel
} from '@kotka/shared/models';
import { forkJoin, from, Observable, Subscription } from 'rxjs';
import { ColumnSettingsModalComponent } from '../column-settings-modal/column-settings-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorage } from 'ngx-webstorage';
import { isEqual, cloneDeep } from 'lodash';
import { DatatableExportService } from '../services/datatable-export.service';
import { CustomDatepickerComponent } from '../components/custom-datepicker.component';
import { CellRendererComponent } from '../renderers/cell-renderer';

type CustomColumnKey = keyof Pick<DatatableColumn, 'hideDefaultHeaderTooltip'|'defaultSelected'>;

interface GridReadyEvent {
  type: string;
  api: GridApi;
  columnApi: ColumnApi;
}

@Component({
  selector: 'kui-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
})
export class DatatableComponent implements OnChanges, OnDestroy {
  @Input() columns: DatatableColumn[] = [];

  @Input() datasource?: DatatableSource;

  @Input() enableFileExport? = false;

  @Input() enableColumnSelection? = false;

  @Input() settingsKey?: string;

  @Input() totalCountTpl?: TemplateRef<any>;

  @Output() rowClicked = new EventEmitter();

  totalCount?: number;

  exportLoading = false;

  modules: Module[] = [InfiniteRowModelModule];
  components: Record<string, any> = {
    agDateInput: CustomDatepickerComponent
  };
  colDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    minWidth: 120,
    sortable: true,
    filter: true,
    floatingFilter: true,
    suppressHeaderMenuButton: true
  };
  rowBuffer = 0;
  rowSelection: 'single'|'multiple'|undefined = 'multiple';
  rowModelType: RowModelType = 'infinite';
  paginationPageSize = 100;
  cacheOverflowSize = 2;
  maxConcurrentDatasourceRequests = 1;
  infiniteInitialRowCount = 1;
  maxBlocksInCache = 10;
  rowData = [];
  gridOptions: GridOptions = {
    rowGroupPanelShow: 'always',
    suppressFieldDotNotation: true,
  };

  private gridApi?: GridApi;
  private gridColumnApi?: ColumnApi;

  private allColumns: DatatableColumn[] = [];

  private sortModel: SortModel[] = [];
  private filterModel: FilterModel = {};

  private isDestroyed = false;
  private loadCellRendererDataToCacheSub: Subscription = new Subscription();

  @LocalStorage('datatable-settings', {}) private settings!: Record<string, ColumnSettings>;
  @LocalStorage('datatable-filters', {}) private filters!: Record<string, FilterModel>;

  constructor(
    private modalService: NgbModal,
    private datatableExportService: DatatableExportService,
    private injector: Injector,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['datasource']) {
      this.updateDatasource();
    }
    if (changes['columns'] || changes['enableColumnSelection']) {
      this.updateColumns();
    }
    if (changes['settingsKey'] && this.settingsKey) {
      this.filterModel = cloneDeep(this.filters[this.settingsKey] || {});
      this.gridApi?.setFilterModel(this.filterModel);
    }
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.loadCellRendererDataToCacheSub.unsubscribe();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.setFilterModel(this.filterModel);
    this.updateDatasource();
  }

  columnUpdated() {
    if (!this.gridColumnApi) {
      return;
    }

    if (this.enableColumnSelection) {
      const selected = this.gridColumnApi
        .getAllDisplayedColumns()
        .map((c) => c.getColId());

      this.updateSettingsAfterColumnUpdate(selected);
    }
  }

  openColumnSettingsModal() {
    const modalRef = this.modalService.open(ColumnSettingsModalComponent, {
      backdrop: 'static',
      size: 'md',
      modalDialogClass: 'column-settings-modal'
    });

    modalRef.componentInstance.columns = this.allColumns;
    modalRef.componentInstance.settings = this.getColumnSettings();
    modalRef.componentInstance.defaultSettings = { selected: this.getDefaultSelectedColumns() };

    from(modalRef.result).subscribe({
      'next': (settings) => {
        this.setColumnSettings(settings);
        this.updateColumns();
        this.cdr.markForCheck();
      },
      'error': () => undefined
    });
  }

  exportData() {
    if (!this.datasource || !this.totalCount) {
      return;
    }

    this.exportLoading = true;

    this.datatableExportService.exportData(
      this.colDefs, this.datasource, this.totalCount, this.sortModel, this.filterModel
    ).subscribe({
      'next': () => {
        this.exportLoading = false;
        this.cdr.markForCheck();
      },
      'error': () => {
        this.exportLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private updateDatasource() {
    if (!this.gridApi || !this.datasource) {
      return;
    }

    this.gridApi.setDatasource({ ...this.datasource, getRows: this.getRows.bind(this) });
  }

  private getRows(params: GetRowsParams) {
    if (this.isDestroyed) {
      return;
    }

    const originalSuccessCallback = params.successCallback;

    const newSuccessCallback = (results: any[], totalItems: number) => {
      if (this.isDestroyed) {
        return;
      }

      this.loadCellRendererDataToCache(results);

      this.totalCount = totalItems;
      this.cdr.markForCheck();

      this.updateLoading(false);
      originalSuccessCallback(results, totalItems);
    };

    this.sortModel = params.sortModel;
    this.filterModel = params.filterModel;
    this.updateStoredFilters(this.filterModel);

    this.updateLoading(true);
    this.datasource!.getRows({ ...params, successCallback: newSuccessCallback });
  }

  private updateLoading(loading: boolean) {
    if (!this.gridApi) {
      return;
    }
    if (loading) {
      this.gridApi.showLoadingOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }

  private loadCellRendererDataToCache(rowData: any[]) {
    const observables: Observable<any>[] = [];

    this.colDefs.forEach(col => {
      if (col.cellRenderer) {
        observables.push(
          (col.cellRenderer as typeof CellRendererComponent).fetchDataToCache(col, rowData, this.injector)
        );
      }
    });

    if (observables.length > 0) {
      this.loadCellRendererDataToCacheSub.add(forkJoin(observables).subscribe());
    }
  }

  private updateColumns() {
    this.allColumns = this.processColumns(this.columns);

    let columns = this.allColumns;
    if (this.enableColumnSelection) {
      columns = this.filterAndSortColumns(columns);
    }

    this.colDefs = this.removeCustomColumnKeys(columns);
  }

  private processColumns(columns: DatatableColumn[]): DatatableColumn[] {
    return columns.map(col => {
      const newCol: DatatableColumn = {
        ...col,
        colId: col.colId || col.field
      };

      if (!col.hideDefaultHeaderTooltip) {
        newCol.headerTooltip = col.headerName;
      }
      if (!col.cellRenderer) {
        newCol.tooltipField = col.field;
      }

      if (this.enableColumnSelection && !newCol.colId) {
        throw Error('Every column should either have colId or field when the enableColumnSelection option is on');
      }

      return newCol;
    });
  }

  private filterAndSortColumns(columns: DatatableColumn[]): DatatableColumn[] {
    const settings = this.getColumnSettings();

    if (!settings.selected) {
      settings.selected = this.getDefaultSelectedColumns();
    }
    const selected = settings.selected;

    columns = columns.filter(col => selected.includes(col.colId!));
    columns.sort((columnA, columnB) => (
      selected.indexOf(columnA.colId!) - selected.indexOf(columnB.colId!)
    ));

    return columns;
  }

  private removeCustomColumnKeys(columns: DatatableColumn[]): ColDef[] {
    return columns.map(col => {
      col = {...col};

      const customKeys: CustomColumnKey[] = ['hideDefaultHeaderTooltip', 'defaultSelected'];
      for (const key of customKeys) {
        delete col[key];
      }

      return col;
    });
  }

  private getDefaultSelectedColumns(): string[] {
    return this.allColumns.filter(col => col.defaultSelected).map(col => col.colId!);
  }

  private updateSettingsAfterColumnUpdate(selected: string[]) {
    if (isEqual(selected, this.getColumnSettings().selected)) {
      return;
    }

    const order = this.getColumnSettings().order;

    if (order) {
      const getSortIndex = (value: string): number => {
        let index = selected.indexOf(value);
        if (index === -1) {
          index = selected.length;
        }
        return index;
      };

      order.sort((valueA, valueB) => (
        getSortIndex(valueA) - getSortIndex(valueB)
      ));
    }

    this.setColumnSettings({ selected, order });
  }

  private updateStoredFilters(filterModel: FilterModel) {
    if (!this.settingsKey) {
      return;
    }

    const colFilters: FilterModel = {};
    Object.keys(filterModel).forEach(colId => {
      const col = this.allColumns.filter(col => col.colId === colId)[0];
      if (col?.rememberFilters) {
        colFilters[colId] = cloneDeep(filterModel[colId]);
      }
    });

   this.filters = { ...this.filters, [this.settingsKey]: colFilters };
  }

  private getColumnSettings() {
    if (!this.settingsKey) {
      throw Error('A settingsKey should be provided when the enableColumnSelection options is on');
    }

    if (!this.settings[this.settingsKey]) {
      this.settings[this.settingsKey] = {};
    }

    return this.settings[this.settingsKey];
  }

  private setColumnSettings(columnSettings: ColumnSettings) {
    if (!this.settingsKey) {
      throw Error('A settingsKey should be provided when the enableColumnSelection options is on');
    }

    this.settings = { ...this.settings, [this.settingsKey]: columnSettings };
  }
}
