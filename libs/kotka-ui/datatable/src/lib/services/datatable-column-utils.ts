import { ColDef, ColDefWithExtra, ColumnSettings, DatatableColumn, ExtraColDef, TupleUnion } from '../models/models';

type CustomColumnKeyList = TupleUnion<keyof ExtraColDef>;

export function getProcessedColumns(columns: DatatableColumn[]): ColDefWithExtra[] {
  return columns.map((col) => {
    const colId = col.colId || col.field;
    if (!colId) {
      throw Error('Every column should either have colId or field');
    }
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

export function getColumnSettingsAfterColumnMove(oldSettings: ColumnSettings, newSelected: string[], changedColId: string): ColumnSettings {
  const order = getOrderAfterColumnMove(oldSettings, newSelected, changedColId);
  return { selected: newSelected, order };
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
    ];
    for (const key of customKeys) {
      delete col[key];
    }

    return col;
  });
}

function getOrderAfterColumnMove(oldSettings: ColumnSettings, newSelected: string[], colId: string): string[] {
  const order = [...oldSettings.order];

  if (!oldSettings.selected.includes(colId) || !newSelected.includes(colId)) {
    return order;
  }

  const oldSelectedIdx = oldSettings.selected.indexOf(colId);
  const newSelectedIdx = newSelected.indexOf(colId);

  const oldOrderIdx = order.indexOf(colId);
  let newOrderIndex = oldOrderIdx;

  if (newSelectedIdx < oldSelectedIdx) {
    newOrderIndex = order.indexOf(newSelected[newSelectedIdx + 1]);
  } else if (newSelectedIdx > oldSelectedIdx) {
    newOrderIndex = order.indexOf(newSelected[newSelectedIdx - 1]);
  }

  if (newOrderIndex !== oldOrderIdx) {
    order.splice(newOrderIndex, 0, order.splice(oldOrderIdx, 1)[0]);
  }

  return order;
}
