import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  RowDragMoveEvent,
  RowSelectedEvent,
} from '@ag-grid-community/core';
import { ColDefWithExtra, ColumnSettings } from '../models/models';
import { AgGridAngular } from '@ag-grid-community/angular';
import { FormsModule } from '@angular/forms';
import { getOrderAfterColumnMove } from '../services/datatable-column-utils';

const comparator = (order: string[]) => (
  columnA: ColDefWithExtra,
  columnB: ColDefWithExtra,
): number => {
  return order.indexOf(columnA.colId) - order.indexOf(columnB.colId);
};

function moveInArray(arr: any[], fromIndex: number, toIndex: number) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

@Component({
  selector: 'kui-column-settings-modal',
  templateUrl: './column-settings-modal.component.html',
  styleUrls: ['./column-settings-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular, FormsModule],
})
export class ColumnSettingsModalComponent {
  modal = inject(NgbActiveModal);

  columns = model<ColDefWithExtra[]>([]);
  settings = model<ColumnSettings>({ selected: [], order: [] });
  defaultSettings = model<ColumnSettings>({ selected: [], order: [] });

  title = model('Select columns');
  description = model('Select columns that are displayed in the result table.');
  searchLabel = model('Search columns:');

  closeModalOnConfirm = input(true);

  resetClick = output<void>();
  confirmClick = output<ColumnSettings>();

  searchText = signal('');

  gridColDefs: ColDef[];
  gridOptions: GridOptions;

  private selected = computed(() => this.settings().selected);
  private order = computed(() => this.settings().order);

  private filteredColumns = computed(() => {
    const searchText = this.searchText().toLowerCase();
    return this.columns().filter((col) =>
      col.headerName?.toLowerCase().includes(searchText),
    );
  });

  private lockedPositions = computed(() => {
    const originalOrder = this.columns().map((col) => col.colId);
    return this.columns().reduce(
      (result, col) => {
        if (col.lockPosition) {
          result[col.colId] = originalOrder.indexOf(col.colId);
        }
        return result;
      },
      <Record<string, number>>{},
    );
  });

  private gridApi = signal<GridApi | undefined>(undefined);
  private visibleOrder = signal<string[]>([]);
  private draggedRow?: string;

  constructor() {
    this.gridColDefs = [
      {
        field: 'headerName',
        rowDrag: (params) => {
          return !params.data.lockPosition;
        },
        resizable: false,
        flex: 1,
      },
    ];
    this.gridOptions = {
      rowDragManaged: true,
      animateRows: true,
      rowSelection: {
        mode: 'multiRow',
        checkboxes: (params) => !params.data.lockPosition,
        hideDisabledCheckboxes: false,
        enableSelectionWithoutKeys: true,
        enableClickSelection: true,
      },
    };

    effect(() => {
      const sortedRowData = [...this.filteredColumns()].sort(
        comparator(this.order()),
      );
      this.visibleOrder.set(sortedRowData.map((col) => col.colId));

      this.gridApi()?.setGridOption('rowData', sortedRowData);
      this.updateSelectedNodes(untracked(this.selected));
    });

    effect(() => {
      this.updateSelectedNodes(this.selected());
    });
  }

  onConfirm() {
    const selected = [...this.selected()];
    const order = this.order();
    selected.sort(
      (colId1, colId2) => order.indexOf(colId1) - order.indexOf(colId2),
    );

    this.confirmClick.emit({ selected, order });

    if (this.closeModalOnConfirm()) {
      this.modal.close({ selected, order });
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi.set(params.api);
  }

  resetSettings() {
    this.settings.set(this.defaultSettings());
    this.resetClick.emit();
  }

  onRowSelect(e: RowSelectedEvent) {
    const selected = this.selected();

    const node = e.node;
    if (node.data.lockPosition && !node.isSelected()) {
      node.setSelected(true);
    } else {
      if (node.isSelected()) {
        if (!selected.includes(node.data.colId)) {
          this.settings.set({
            ...this.settings(),
            selected: [...selected, node.data.colId],
          });
        }
      } else {
        if (selected.includes(node.data.colId)) {
          this.settings.set({
            ...this.settings(),
            selected: selected.filter((colId) => colId !== node.data.colId),
          });
        }
      }
    }
  }

  onRowDragMove(event: RowDragMoveEvent<ColDefWithExtra>) {
    this.draggedRow = event.node.data?.colId;
  }

  onDragStopped() {
    this.onRowDragEnd();
  }

  onRowDragEnd() {
    if (!this.draggedRow) {
      return;
    }

    let visibleOrder: string[] = [];
    this.gridApi()?.forEachNodeAfterFilterAndSort((node) => {
      visibleOrder.push(node.data.colId);
    });

    const order = getOrderAfterColumnMove(
      this.order(),
      this.visibleOrder(),
      visibleOrder,
      this.draggedRow,
    );

    // restore locked positions
    for (const colId of Object.keys(this.lockedPositions())) {
      const lockedIdx = this.lockedPositions()[colId];
      const currentIdx = order.indexOf(colId);
      if (currentIdx !== lockedIdx) {
        moveInArray(order, currentIdx, lockedIdx);
      }
    }
    visibleOrder = order.filter((colId) => visibleOrder.includes(colId));

    this.settings.set({ ...this.settings(), order: order });
    this.visibleOrder.set(visibleOrder);

    this.draggedRow = undefined;
  }

  private updateSelectedNodes(selected: string[]) {
    this.gridApi()?.forEachNode((node) => {
      const isSelected = selected.includes(node.data.colId);
      if (node.isSelected() !== isSelected) {
        node.setSelected(isSelected);
      }
    });
  }
}
