import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnSettings, DatatableColumn } from '../datatable/datatable.component';
import { ColDef, GridApi, GridOptions, GridReadyEvent } from '@ag-grid-community/core';
import { combineLatest, ReplaySubject, take } from 'rxjs';

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
        { field: 'headerName', rowDrag: true, checkboxSelection: true, resizable: false, flex: 1 }
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
