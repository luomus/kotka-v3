import { ColDef, ColDefWithExtra, ColumnSettings, DatatableColumn, ExtraColDef, TupleUnion } from '../models/models';

type CustomColumnKeyList = TupleUnion<keyof ExtraColDef>;

export function getColId(col: DatatableColumn): string {
  const colId = col.colId || col.field;
  if (!colId) {
    throw Error('Every column should either have colId or field');
  }
  return colId;
}

export function getProcessedColumns(columns: DatatableColumn[]): ColDefWithExtra[] {
  columns = [...columns].sort((a, b) => {
    const lockPositionA = a.lockPosition === true ? 'left' : a.lockPosition || undefined;
    const lockPositionB = b.lockPosition === true ? 'left' : b.lockPosition || undefined;

    if (lockPositionA === lockPositionB) {
      return 0;
    } else if (lockPositionA) {
      return lockPositionA === 'right' ? 1 : -1;
    } else {
      return lockPositionB === 'right' ? -1 : 1;
    }
  });

  return columns.map((col) => {
    const colId = getColId(col);
    const newCol: ColDefWithExtra = { ...col, colId };

    if (!col.hideDefaultHeaderTooltip) {
      newCol.headerTooltip = col.headerName;
    }
    if (!col.cellRenderer) {
      newCol.tooltipField = col.field;
    }

    return newCol;
  });
}

export function getVisibleColDefs(columns: ColDefWithExtra[], settings: ColumnSettings): ColDef[] {
  return getColDefsFromColumns(columns, settings);
}

export function getDefaultColumnSettings(columns: ColDefWithExtra[], columnSelectionEnabled?: boolean): ColumnSettings {
  const selectedColumns = columnSelectionEnabled
    ? columns.filter(col => col.defaultSelected)
    : columns;

  const selected = selectedColumns.map(col => col.colId);
  const order = columns.map(col => col.colId);

  return { selected, order };
}

export function getOrderAfterColumnMove(oldOrder: string[], oldVisibleOrder: string[], newVisibleOrder: string[], movedColId: string,): string[] {
  const order = [...oldOrder];

  if (!oldVisibleOrder.includes(movedColId) || !newVisibleOrder.includes(movedColId)) {
    return order;
  }

  const oldSelectedIdx = oldVisibleOrder.indexOf(movedColId);
  const newSelectedIdx = newVisibleOrder.indexOf(movedColId);

  const oldOrderIdx = order.indexOf(movedColId);
  let newOrderIndex = oldOrderIdx;

  if (newSelectedIdx < oldSelectedIdx) {
    newOrderIndex = order.indexOf(newVisibleOrder[newSelectedIdx + 1]);
  } else if (newSelectedIdx > oldSelectedIdx) {
    newOrderIndex = order.indexOf(newVisibleOrder[newSelectedIdx - 1]);
  }

  if (newOrderIndex !== oldOrderIdx) {
    order.splice(newOrderIndex, 0, order.splice(oldOrderIdx, 1)[0]);
  }

  return order;
}

function getColDefsFromColumns(columns: ColDefWithExtra[], settings: ColumnSettings): ColDef[] {
  columns = filterAndSortColumns(columns, settings);
  return removeCustomColumnKeys(columns);
}

function filterAndSortColumns(columns: ColDefWithExtra[], settings: ColumnSettings): ColDefWithExtra[] {
  columns = columns.filter(col => (settings.selected.includes(col.colId)));
  columns.sort(
    (columnA, columnB) =>
      settings.order.indexOf(columnA.colId) - settings.order.indexOf(columnB.colId),
  );

  return columns;
}

function removeCustomColumnKeys(columns: ColDefWithExtra[]): ColDef[] {
  return columns.map((col) => {
    col = { ...col };

    const customKeys: CustomColumnKeyList = [
      'hideDefaultHeaderTooltip',
      'hideDefaultTooltip',
      'defaultSelected',
      'rememberFilters',
      'sortField'
    ];
    for (const key of customKeys) {
      delete col[key];
    }

    return col;
  });
}
