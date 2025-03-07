import {
  ColDef as AgGridColDef,
  DateFilterModel,
  ICombinedSimpleModel,
  IGetRowsParams,
  TextFilterModel,
} from '@ag-grid-community/core';

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type TupleUnion<U extends string, R extends any[] = []> = {
  [S in U]: Exclude<U, S> extends never
    ? [...R, S]
    : TupleUnion<Exclude<U, S>, [...R, S]>;
}[U];

export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

export type DatatableSort = SortModel[];

export interface BooleanFilterModel {
  filterType: 'boolean';
  type: 'equals';
  filter: boolean;
}

export type BasicFilterModel =
  | TextFilterModel
  | DateFilterModel
  | BooleanFilterModel;
export type CombinedFilterModel = ICombinedSimpleModel<BasicFilterModel>;
export type FilterModel = BasicFilterModel | CombinedFilterModel;

export type DatatableFilter = Record<string, FilterModel>;

// props related to hiding are not supported because they don't work with the custom column selection
export interface ColDef extends Omit<AgGridColDef, 'hide'|'lockVisible'> {
  colId: string;
}

export interface ExtraColDef {
  hideDefaultHeaderTooltip?: boolean;
  hideDefaultTooltip?: boolean;
  defaultSelected?: boolean;
  rememberFilters?: boolean;
}

export type ColDefWithExtra = ColDef & ExtraColDef;

export type DatatableColumn = PartialBy<ColDefWithExtra, 'colId'>;

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

export function isBasicFilterModel(
  filterModel: FilterModel,
): filterModel is BasicFilterModel {
  return 'type' in filterModel;
}

export function isTextFilterModel(
  basicFilterModel: BasicFilterModel,
): basicFilterModel is TextFilterModel {
  return basicFilterModel.filterType === 'text';
}

export function isDateFilterModel(
  basicFilterModel: BasicFilterModel,
): basicFilterModel is DateFilterModel {
  return basicFilterModel.filterType === 'date';
}
