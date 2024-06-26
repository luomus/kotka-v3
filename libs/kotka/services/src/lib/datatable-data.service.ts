import { Observable } from 'rxjs';
import {
  KotkaDocumentObject,
  ListResponse,
  KotkaDocumentObjectType,
  SortModel,
  DatatableColumn,
  FilterModel
} from '@kotka/shared/models';
import { DataService} from './data.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class DatatableDataService {
  constructor(
    private dataService: DataService
  ) {}

  getData(dataType: KotkaDocumentObjectType, columns: DatatableColumn[], startRow: number, endRow: number, sortModel: SortModel[], filterModel: FilterModel): Observable<ListResponse<KotkaDocumentObject>> {
    const pageSize = endRow - startRow;
    const page = (startRow / pageSize) + 1;

    const colIdFieldMap = this.getColIdFieldMap(columns);
    const sort = this.sortModelToSortString(sortModel, colIdFieldMap);
    const searchQuery = this.filterModelToSearchQuery(filterModel, colIdFieldMap);

    return this.dataService.getData(dataType, page, pageSize, sort, searchQuery);
  }

  private getColIdFieldMap(columns: DatatableColumn[]): Record<string, string> {
    const result: Record<string, string> = {};

    columns.forEach(column => {
      if (column.field) {
        result[column.colId || column.field] = column.field;
      }
    });

    return result;
  }

  private sortModelToSortString(sortModel: SortModel[], colIdFieldMap: Record<string, string>): string {
    return sortModel.map(sort => colIdFieldMap[sort.colId] + ' ' + sort.sort).join(',');
  }

  private filterModelToSearchQuery(filterModel: FilterModel, colIdFieldMap: Record<string, string>): string {
    return Object.keys(filterModel).map(
      key => this.filterModelEntryToSearchQuery(colIdFieldMap[key], filterModel[key])
    ).join(' AND ');
  }

  private filterModelEntryToSearchQuery(field: string, filterModel: FilterModel): string {
    if (!['text', 'date'].includes(filterModel['filterType'])) {
      throw new Error('Filter type ' + filterModel['filterType'] + ' is not supported!');
    }

    const type = filterModel['type'];
    if (type) {
      let filter: string, filter2: string;
      if (filterModel['filterType'] === 'date') {
        filter = this.getDateFilter(filterModel['dateFrom']);
        filter2 = this.getDateFilter(filterModel['dateTo']);
      } else {
        filter = this.escapeFilterString(filterModel['filter']);
      }

      switch(type) {
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
          break;
        }
      }
    } else if (filterModel['operator']) {
      const condition1 = this.filterModelEntryToSearchQuery(field, filterModel['condition1']);
      const condition2 = this.filterModelEntryToSearchQuery(field, filterModel['condition2']);
      return `${condition1} ${filterModel['operator']} ${condition2}`;
    }

    return '';
  }

  private getDateFilter(searchQuery?: string): string {
    return searchQuery ? searchQuery.split(' ')[0] : '';
  }

  private escapeFilterString(searchQuery?: string): string {
    if (!searchQuery) {
      return '';
    }

    const escapedChars = ['\\', '*', '?', '+', '-', '&&', '||', '!', '(', ')', '{', '}', '[', ']', '^', '~', ':', '"', '=', '/', ' '];
    escapedChars.forEach(char => {
      searchQuery = searchQuery!.split(char).join('\\' + char);
    });

    const removedChars = ['<', '>'];
    removedChars.forEach(char => {
      searchQuery = searchQuery!.split(char).join('');
    });

    return searchQuery;
  }
}
