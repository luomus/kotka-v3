import { ColDef, IGetRowsParams } from '@ag-grid-community/core';

export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

export type FilterModel = Record<string, any>;

export interface CustomColDef {
  hideDefaultHeaderTooltip?: boolean;
  hideDefaultTooltip?: boolean;
  defaultSelected?: boolean;
  rememberFilters?: boolean;
}

export type DatatableColumn = ColDef & CustomColDef;

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

export type TupleUnion<U extends string, R extends any[] = []> = {
  [S in U]: Exclude<U, S> extends never ? [...R, S] : TupleUnion<Exclude<U, S>, [...R, S]>;
}[U];
