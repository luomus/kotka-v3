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
  Module,
  RowModelType
} from '@ag-grid-community/core';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import { ColumnSettings, DatatableColumn, DatatableSource } from '@kotka/shared/models';
import { from } from 'rxjs';
import { ColumnSettingsModalComponent } from '../column-settings-modal/column-settings-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorage } from 'ngx-webstorage';
import { isEqual } from 'lodash';
import { DatatableExportService } from '../services/datatable-export.service';

type CustomColumnKey = keyof Pick<DatatableColumn, 'hideDefaultTooltip'|'hideDefaultHeaderTooltip'|'defaultSelected'>;

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
  public totalCount?: number; // should be provided when enableFileExport is true

  @Input()
  public enableFileExport? = false;

  @Input()
  public enableColumnSelection? = false;

  @Input()
  public settingsKey?: string;

  @Output()
  rowClicked = new EventEmitter();

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
    private datatableExportService: DatatableExportService,
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

    this.datatableExportService.exportData(this.colDefs, this.datasource, this.totalCount);
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

  private removeCustomColumnKeys(columns: DatatableColumn[]): ColDef[] {
    return columns.map(col => {
      col = {...col};

      const customKeys: CustomColumnKey[] = ['hideDefaultHeaderTooltip', 'hideDefaultTooltip', 'defaultSelected'];
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
