import {
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

export type DatatableColumn = ColDef;

export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

export interface GetRowsParams extends IGetRowsParams {
  sortModel: SortModel[];
}

export interface DatatableSource {
  rowCount?: number;
  getRows: (params: GetRowsParams) => void;
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
  @Input()
  public columnDefs: DatatableColumn[] = [];

  @Input()
  public datasource?: DatatableSource;

  @Input()
  public loading? = false;

  @Output()
  rowClicked = new EventEmitter();

  @Output()
  selectedColsChange = new EventEmitter<string[]>();

  public modules: Module[] = [InfiniteRowModelModule];
  public defaultColDef: DatatableColumn = {
    flex: 1,
    resizable: true,
    minWidth: 100,
    sortable: true,
    filter: true
  };
  public components: any;
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
}
