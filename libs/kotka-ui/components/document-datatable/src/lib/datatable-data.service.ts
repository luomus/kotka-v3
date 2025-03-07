import { Observable } from 'rxjs';
import {
  KotkaDocumentObject,
  ListResponse,
  KotkaDocumentObjectType,
} from '@kotka/shared/models';
import {
  DatatableColumn,
  FilterModel,
  isBasicFilterModel,
  isTextFilterModel,
  isDateFilterModel,
  DatatableFilter,
  DatatableSort,
  BasicFilterModel,
  CombinedFilterModel,
} from '@kotka/ui/datatable';
import { Injectable } from '@angular/core';
import { ApiClient } from '@kotka/ui/data-services';

@Injectable({
  providedIn: 'root',
})
export class DatatableDataService {
  constructor(private apiClient: ApiClient) {}

  getData(
    dataType: KotkaDocumentObjectType,
    columns: DatatableColumn[],
    startRow: number,
    endRow: number,
    sortModel: DatatableSort,
    filterModel: DatatableFilter,
    extraSearchQuery?: string,
  ): Observable<ListResponse<KotkaDocumentObject>> {
    const pageSize = endRow - startRow;
    const page = startRow / pageSize + 1;

    const colIdFieldMap = this.getColIdFieldMap(columns);
    const sort = this.sortModelToSortString(sortModel, colIdFieldMap);
    const filterSearchQuery = this.filterModelToSearchQuery(
      filterModel,
      colIdFieldMap,
    );
    const searchQuery = [extraSearchQuery, filterSearchQuery]
      .filter((query) => !!query)
      .map((query) => `(${query})`)
      .join(' AND ');

    return this.apiClient.getDocumentList(
      dataType,
      page,
      pageSize,
      sort,
      searchQuery,
    );
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

  private getColIdFieldMap(columns: DatatableColumn[]): Record<string, string> {
    const result: Record<string, string> = {};

    columns.forEach((column) => {
      if (column.field) {
        result[column.colId || column.field] = column.field;
      }
    });

    return result;
  }

  private sortModelToSortString(
    sortModel: DatatableSort,
    colIdFieldMap: Record<string, string>,
  ): string {
    return sortModel
      .map((sort) => colIdFieldMap[sort.colId] + ' ' + sort.sort)
      .join(',');
  }

  private filterModelToSearchQuery(
    filterModel: DatatableFilter,
    colIdFieldMap: Record<string, string>,
  ): string {
    return Object.keys(filterModel)
      .map((key) =>
        this.filterModelEntryToSearchQuery(
          colIdFieldMap[key],
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
