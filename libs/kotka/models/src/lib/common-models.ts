import {
  ColDef,
  DateFilterModel,
  ICombinedSimpleModel,
  IGetRowsParams,
  TextFilterModel
} from '@ag-grid-community/core';

export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

export type DatatableSort = SortModel[];

export interface BooleanFilterModel {
  filterType: 'boolean',
  type: 'equals',
  filter: boolean
}

export type BasicFilterModel = TextFilterModel|DateFilterModel|BooleanFilterModel;
export type CombinedFilterModel = ICombinedSimpleModel<BasicFilterModel>
export type FilterModel = BasicFilterModel|CombinedFilterModel;

export type DatatableFilter = Record<string, FilterModel>;

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

export function isBasicFilterModel(filterModel: FilterModel): filterModel is BasicFilterModel {
  return 'type' in filterModel;
}

export function isTextFilterModel(basicFilterModel: BasicFilterModel): basicFilterModel is TextFilterModel {
  return basicFilterModel.filterType === 'text';
}
export function isDateFilterModel(basicFilterModel: BasicFilterModel): basicFilterModel is DateFilterModel {
  return basicFilterModel.filterType === 'date';
}
