import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  RowSelectedEvent
} from '@ag-grid-community/core';
import { combineLatest, ReplaySubject, take } from 'rxjs';
import { ColumnSettings, DatatableColumn } from '@kotka/shared/models';

@Component({
  selector: 'kui-column-settings-modal',
  templateUrl: './column-settings-modal.component.html',
  styleUrls: ['./column-settings-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnSettingsModalComponent {
  columnsSubject: ReplaySubject<DatatableColumn[]> = new ReplaySubject(1);
  @Input() set columns(columns: DatatableColumn[]) {
    this.columnsSubject.next(columns);
  }

  settingsSubject: ReplaySubject<ColumnSettings> = new ReplaySubject(1);
  @Input() set settings(settings: ColumnSettings) {
    this.settingsSubject.next(settings);
  }

  @Input() defaultSettings?: ColumnSettings;

  colDefs: ColDef[] = [];
  rowData: DatatableColumn[] = [];

  gridOptions: GridOptions = {
    rowDragManaged: true,
    animateRows: true
  };

  private allColumns: DatatableColumn[] = [];
  private initialSettings?: ColumnSettings;
  private rowIsDragged = false;
  private gridApi?: GridApi;

  constructor(
    public modal: NgbActiveModal,
    private cdr: ChangeDetectorRef
  ) {
    combineLatest([this.columnsSubject, this.settingsSubject]).pipe(
      take(1)
    ).subscribe(([columns, settings]: [DatatableColumn[], ColumnSettings]) => {
      this.allColumns = columns;
      this.initialSettings = settings;

      this.colDefs = [
        {
          field: 'headerName',
          rowDrag: (params) => {
            return !params.data.lockPosition;
          },
          checkboxSelection: (params) => {
            return !params.data.lockPosition;
          },
          resizable: false,
          flex: 1,
          showDisabledCheckboxes: true
        }
      ];
      this.updateRowData();

      this.cdr.markForCheck();
    });
  }

  onConfirm() {
    if (!this.gridApi) {
      return;
    }

    const selected: string[] = [];
    const order: string[] = [];

    this.gridApi.forEachNodeAfterFilterAndSort((node) => {
      if (node.isSelected()) {
        selected.push(node.data.colId);
      }
      order.push(node.data.colId);
    });

    this.modal.close({ selected, order });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.updateRowData();
  }

  resetSettings() {
    if (!this.defaultSettings || !this.gridApi) {
      return;
    }

    this.initialSettings = this.defaultSettings;
    this.updateRowData();
  }

  onRowSelect(e: RowSelectedEvent) {
    const node = e.node;
    if (node.data.lockPosition && !node.isSelected()) {
      node.setSelected(true);
    }
  }

  onRowDragMove() {
    this.rowIsDragged = true;
  }

  onDragStopped() {
    if (this.rowIsDragged) {
      this.onRowDragEnd();
    }
  }

  onRowDragEnd() {
    function moveInArray(arr: any[], fromIndex: number, toIndex: number) {
      const element = arr[fromIndex];
      arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, element);
    }

    const originalOrder = this.allColumns.map(col => col.colId);

    const selected: string[] = [];
    const order: string[] = [];
    let hasChanges = false;

    this.gridApi!.forEachNodeAfterFilterAndSort((node, idx) => {
      if (node.isSelected()) {
        selected.push(node.data.colId);
      }
      order.push(node.data.colId);

      if (node.data.lockPosition && idx !== originalOrder.indexOf(node.data.colId)) {
        if (node.isSelected()) {
          moveInArray(selected, idx, 0);
        }
        moveInArray(order, idx, 0);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.initialSettings = { selected, order };
      this.updateRowData();
    }

    this.rowIsDragged = false;
  }

  private updateRowData() {
    if (!this.gridApi) {
      return;
    }

    this.rowData = [...this.allColumns].sort(this.comparator.bind(this));
    this.gridApi.setRowData(this.rowData);
    this.setInitialSelected();
  }

  private comparator(columnA: DatatableColumn, columnB: DatatableColumn): number {
    if (!this.initialSettings?.order) {
      return 0;
    }

    const order = this.initialSettings.order;

    const colIdA = columnA.colId!;
    const colIdB = columnB.colId!;

    return order.indexOf(colIdA) - order.indexOf(colIdB);
  }

  private setInitialSelected() {
    if (!this.initialSettings?.selected || !this.gridApi) {
      return;
    }

    const selected = this.initialSettings.selected;

    this.gridApi.forEachNode(node=> {
      if (selected.includes(node.data.colId!)) {
        node.setSelected(true);
      }
    });
  }
}
