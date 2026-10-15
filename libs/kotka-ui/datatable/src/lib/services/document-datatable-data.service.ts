import {
  BasicFilterModel,
  DatatableColumn,
  DatatableFilter,
  DatatableSort,
  FilterModel,
  isBasicFilterModel,
  isDateFilterModel
} from '../models/models';
import { inject, Injectable } from '@angular/core';
import { ApiClient, SearchParams } from '@kotka/ui/core';
import {
  builderQueryToQueryString,
  joinQueryStrings,
  SearchCriteria,
  SearchGroup,
} from '@kotka/ui/search';
import {
  IndexType,
  KotkaDocument,
  KotkaDocumentType,
  SearchResponse
} from '@kotka/shared/models';
import { ListResponse } from '@luomus/laji-schema';
import { Observable } from 'rxjs';
import { getColId } from './datatable-column-utils';

export type DatatableRow<
  T extends KotkaDocumentType = KotkaDocumentType,
  S extends IndexType | undefined = IndexType | undefined
> = S extends IndexType ? SearchResponse : ListResponse<KotkaDocument<T>>

type ColIdFieldMap = Record<string, { sortField: string; filterField: string }>;

@Injectable({
  providedIn: 'root',
})
export class DocumentDatatableDataService {
  private apiClient = inject(ApiClient);

  getRows<
    T extends KotkaDocumentType,
    S extends IndexType | undefined
  >(type: T, index: S | undefined, searchParams: SearchParams, aggregateBy?: string[]): Observable<DatatableRow<T, S>>;
  getRows(type: KotkaDocumentType, index: IndexType | undefined, searchParams: SearchParams, aggregateBy?: string[]): Observable<DatatableRow> {
    if (index) {
      if (type !== KotkaDocumentType.specimen) {
        throw new Error(
          'Index can only be specified for specimen document type!',
        );
      }

      return this.apiClient.searchDocuments(
        type,
        index,
        searchParams.searchQuery,
        searchParams.page,
        searchParams.pageSize,
        searchParams.sort,
        undefined,
        aggregateBy
      );
    }

    return this.apiClient.getDocumentList(
      type,
      searchParams.searchQuery,
      searchParams.page,
      searchParams.pageSize,
      searchParams.sort,
    );
  }

  getSearchParams(
    columns: DatatableColumn[],
    startRow: number,
    endRow: number,
    sortModel: DatatableSort,
    filterModel: DatatableFilter,
    extraSearchQuery = ''
  ): SearchParams {
    const pageSize = endRow - startRow;
    const page = startRow / pageSize + 1;

    const colIdFieldMap = this.getColIdFieldMap(columns);
    const sort = this.sortModelToSortString(sortModel, colIdFieldMap);
    const filterSearchQuery = this.filterModelToSearchQuery(
      filterModel,
      colIdFieldMap,
    );
    const searchQuery = joinQueryStrings('AND', extraSearchQuery, filterSearchQuery);

    return {
      searchQuery,
      page,
      pageSize,
      sort,
    };
  }

  getSearchQueryForMultiColumnTextSearch(
    fields: string[],
    filterText: string,
  ): string {
    if (!filterText) {
      return '';
    }

    const criteria: SearchCriteria[] = fields.map((field) => ({
      field,
      operator: 'contains',
      value: filterText,
    }));

    return builderQueryToQueryString({
      groups: [{ criteria, joinOperator: 'OR' }],
      joinOperator: 'OR',
    });
  }

  private getColIdFieldMap(columns: DatatableColumn[]): ColIdFieldMap {
    const result: ColIdFieldMap = {};

    columns.forEach((column) => {
      if (column.field) {
        result[getColId(column)] = {
          sortField: column.sortField || column.field,
          filterField: column.field,
        };
      }
    });

    return result;
  }

  private sortModelToSortString(
    sortModel: DatatableSort,
    colIdFieldMap: ColIdFieldMap,
  ): string {
    return sortModel
      .map(
        (sort) => (colIdFieldMap[sort.colId]?.sortField || sort.colId) + ' ' + sort.sort,
      )
      .join(',');
  }

  private filterModelToSearchQuery(
    filterModel: DatatableFilter,
    colIdFieldMap: ColIdFieldMap,
  ): string {
    const groups: SearchGroup[] = Object.keys(filterModel).map((key) =>
      this.filterModelEntryToSearchGroup(
        colIdFieldMap[key]?.filterField || key,
        filterModel[key],
      ),
    );

    return builderQueryToQueryString({ groups, joinOperator: 'AND' });
  }

  private filterModelEntryToSearchGroup(
    field: string,
    filterModel: FilterModel,
  ): SearchGroup {
    if (isBasicFilterModel(filterModel)) {
      return {
        criteria: [this.basicFilterModelToSearchCriteria(field, filterModel)],
        joinOperator: 'AND',
      };
    }

    if (!filterModel.conditions) {
      throw new Error('Filter model has errors!');
    }

    return {
      criteria: filterModel.conditions.map((condition) =>
        this.basicFilterModelToSearchCriteria(field, condition),
      ),
      joinOperator: filterModel.operator,
    };
  }

  private basicFilterModelToSearchCriteria(
    field: string,
    filterModel: BasicFilterModel,
  ): SearchCriteria {
    if (
      !(
        filterModel.filterType &&
        ['text', 'date', 'boolean'].includes(filterModel.filterType)
      )
    ) {
      throw new Error(
        'Filter model type ' + filterModel.filterType + ' is not supported!',
      );
    }

    if (!filterModel.type) {
      throw new Error(
        'Filter type is required!',
      );
    }

    let value: string;
    let value2: string | undefined;

    if (isDateFilterModel(filterModel)) {
      value = this.getDateFilter(filterModel.dateFrom);
      value2 = this.getDateFilter(filterModel.dateTo);
    } else {
      value = filterModel.filter != null ? String(filterModel.filter) : '';
    }

    return { field, operator: filterModel.type, value, value2 };
  }

  private getDateFilter(searchQuery?: string | null): string {
    return searchQuery ? searchQuery.split(' ')[0] : '';
  }
}
