import {
  BasicFilterModel,
  CombinedFilterModel,
  DatatableColumn,
  DatatableFilter,
  DatatableSort,
  FilterModel,
  isBasicFilterModel,
  isDateFilterModel,
  isTextFilterModel,
} from '../models/models';
import { inject, Injectable } from '@angular/core';
import { ApiClient, SearchParams } from '@kotka/ui/core';
import { joinQueryStrings } from '@kotka/ui/search';
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
    filterText = this.escapeFilterString(filterText);
    return fields.map((field) => `${field}:(*${filterText}*)`).join(' OR ');
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
    return Object.keys(filterModel)
      .map((key) =>
        this.filterModelEntryToSearchQuery(
          colIdFieldMap[key]?.filterField || key,
          filterModel[key],
        ),
      )
      .join(' AND ');
  }

  private filterModelEntryToSearchQuery(
    field: string,
    filterModel: FilterModel,
  ): string {
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

    if (isBasicFilterModel(filterModel)) {
      return this.basicFilterModelEntryToSearchQuery(field, filterModel);
    } else {
      return this.combinedFilterModelEntryToSearchQuery(field, filterModel);
    }
  }

  private basicFilterModelEntryToSearchQuery(
    field: string,
    filterModel: BasicFilterModel,
  ): string {
    let filter: string | boolean, filter2: string;
    if (isTextFilterModel(filterModel)) {
      filter = this.escapeFilterString(filterModel.filter);
    } else if (isDateFilterModel(filterModel)) {
      filter = this.getDateFilter(filterModel.dateFrom);
      filter2 = this.getDateFilter(filterModel.dateTo);
    } else {
      filter = filterModel.filter;
    }

    switch (filterModel.type) {
      case 'contains': {
        return `${field}:(*${filter}*)`;
      }
      case 'notContains': {
        return `${field}:(NOT *${filter}*)`;
      }
      case 'equals': {
        return `${field}:(${filter})`;
      }
      case 'notEqual': {
        return `${field}:(NOT ${filter})`;
      }
      case 'startsWith': {
        return `${field}:(${filter}*)`;
      }
      case 'endsWith': {
        return `${field}:(*${filter})`;
      }
      case 'blank': {
        return `_exists_:(NOT ${field})`;
      }
      case 'notBlank': {
        return `_exists_:${field}`;
      }
      case 'lessThan': {
        return `${field}:[* TO ${filter}]`;
      }
      case 'greaterThan': {
        return `${field}:[${filter} TO *]`;
      }
      case 'inRange': {
        return `${field}:[${filter} TO ${filter2!}]`;
      }
      default: {
        throw new Error(
          'Filter type ' + filterModel.type + ' is not supported!',
        );
      }
    }
  }

  private combinedFilterModelEntryToSearchQuery(
    field: string,
    filterModel: CombinedFilterModel,
  ): string {
    if (!filterModel.conditions) {
      throw new Error('Filter model has errors!');
    }

    return filterModel.conditions
      .map((condition) => this.filterModelEntryToSearchQuery(field, condition))
      .join(` ${filterModel.operator} `);
  }

  private getDateFilter(searchQuery?: string | null): string {
    return searchQuery ? searchQuery.split(' ')[0] : '';
  }

  private escapeFilterString(searchQuery?: string | null): string {
    if (!searchQuery) {
      return '';
    }

    const escapedChars = [
      '\\',
      '*',
      '?',
      '+',
      '-',
      '&&',
      '||',
      '!',
      '(',
      ')',
      '{',
      '}',
      '[',
      ']',
      '^',
      '~',
      ':',
      '"',
      '=',
      '/',
      ' ',
    ];
    escapedChars.forEach((char) => {
      searchQuery = searchQuery!.split(char).join('\\' + char);
    });

    const removedChars = ['<', '>'];
    removedChars.forEach((char) => {
      searchQuery = searchQuery!.split(char).join('');
    });

    return searchQuery;
  }
}
