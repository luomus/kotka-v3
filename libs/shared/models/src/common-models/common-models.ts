import { ColDef, IGetRowsParams } from '@ag-grid-community/core';

export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

export type FilterModel = Record<string, any>;

export interface DatatableColumn extends ColDef {
  hideDefaultHeaderTooltip?: boolean;
  hideDefaultTooltip?: boolean;
  defaultSelected?: boolean;
  rememberFilters?: boolean;
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
