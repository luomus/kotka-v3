import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ColDef,
  ColumnApi,
  GridApi,
  GridOptions,
  IGetRowsParams,
  Module,
  RowModelType
} from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import { SortModel } from '@kotka/shared/models';
import { from } from 'rxjs';
import { ColumnSettingsModalComponent } from '../column-settings-modal/column-settings-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorage } from 'ngx-webstorage';

export interface DatatableColumn extends ColDef {
  hideDefaultHeaderTooltip?: boolean;
  hideDefaultTooltip?: boolean;
  defaultSelected?: boolean;
}

export interface GetRowsParams extends IGetRowsParams {
  sortModel: SortModel[];
}

export interface DatatableSource {
  rowCount?: number;
  getRows: (params: GetRowsParams) => void;
}

export interface ColumnSettings {
  selected?: string[];
  order?: string[];
}

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
export class DatatableComponent implements OnChanges {
  @Input() columns: DatatableColumn[] = [];

  @Input()
  public datasource?: DatatableSource;

  @Input()
  public loading? = false;

  @Input()
  public enableColumnSelection? = false;

  @Input()
  public settingsKey?: string;

  @Output()
  rowClicked = new EventEmitter();

  @Output()
  selectedColsChange = new EventEmitter<string[]>();

  public modules: Module[] = [InfiniteRowModelModule];
  public colDefs: ColDef[] = [];
  public defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    minWidth: 120,
    sortable: true,
    filter: true,
    floatingFilter: true
  };
  public rowBuffer = 0;
  public rowSelection: 'single'|'multiple'|undefined = 'multiple';
  public rowModelType: RowModelType = 'infinite';
  public paginationPageSize = 100;
  public cacheOverflowSize = 2;
  public maxConcurrentDatasourceRequests = 1;
  public infiniteInitialRowCount = 1;
  public maxBlocksInCache = 10;
  public rowData = [];
  public gridOptions: GridOptions = {
    rowGroupPanelShow: 'always',
    suppressFieldDotNotation: true,
  };

  public gridApi?: GridApi;
  public gridColumnApi?: ColumnApi;

  private allColumns: DatatableColumn[] = [];

  @LocalStorage('datatable-settings', {}) private settings!: Record<string, ColumnSettings>;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {}

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.updateDatasource();
    this.updateLoading();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['loading']) {
      this.updateLoading();
    }
    if (changes['datasource']) {
      this.updateDatasource();
    }
    if (changes['columns'] || changes['enableColumnSelection']) {
      this.updateColumns();
    }
  }

  updateDatasource() {
    if (!this.gridApi || !this.datasource) {
      return;
    }
    this.gridApi.setDatasource(this.datasource);
  }

  updateLoading() {
    if (!this.gridApi) {
      return;
    }
    if (this.loading) {
      this.gridApi.showLoadingOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }

  columnUpdated() {
    if (this.gridColumnApi) {
      this.selectedColsChange.emit(
        this.gridColumnApi
          .getAllDisplayedColumns()
          .map((c) => c.getUserProvidedColDef()?.field || '')
      );
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

    from(modalRef.result).subscribe({
      'next': (settings) => {
        this.setColumnSettings(settings);
        this.updateColumns();
        this.cdr.markForCheck();
      },
      'error': () => undefined
    });
  }

  private updateColumns() {
    this.allColumns = this.processColumns(this.columns);

    let columns = this.allColumns;
    if (this.enableColumnSelection) {
      columns = this.filterAndSortColumns(columns);
    }

    this.colDefs = columns.map(col => ({
      ...col,
      hideDefaultHeaderTooltip: undefined,
      hideDefaultTooltip: undefined,
      defaultSelected: undefined
    }));
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
      if (!col.hideDefaultTooltip) {
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

  private getDefaultSelectedColumns(): string[] {
    return this.allColumns.filter(col => col.defaultSelected).map(col => col.colId!);
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

    const settings = this.settings;
    settings[this.settingsKey] = columnSettings;
    this.settings = settings;
  }
}
