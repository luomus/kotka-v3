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
    const searchQuery = this.filterModelToSearchQuery(filterModel);

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

  private filterModelToSearchQuery(filterModel: FilterModel): string {
    return Object.keys(filterModel).map(
      key => this.filterModelEntryToSearchQuery(key, filterModel[key])
    ).join(' AND ');
  }

  private filterModelEntryToSearchQuery(key: string, filterModel: FilterModel): string {
    if (filterModel['filterType'] !== 'text') {
      return '';
    }

    const type = filterModel['type'];
    if (type) {
      const filter = this.escapeFilterString(filterModel['filter']);
      switch(type) {
        case 'contains': {
          return `${key}:(*${filter}*)`;
        }
        case 'notContains': {
          return `${key}:(NOT *${filter}*)`;
        }
        case 'equals': {
          return `${key}:(${filter})`;
        }
        case 'notEqual': {
          return `${key}:(NOT ${filter})`;
        }
        case 'startsWith': {
          return `${key}:(${filter}*)`;
        }
        case 'endsWith': {
          return `${key}:(*${filter})`;
        }
        case 'blank': {
          return `_exists_:(NOT ${key})`;
        }
        case 'notBlank': {
          return `_exists_:${key}`;
        }
        default: {
          break;
        }
      }
    } else if (filterModel['operator']) {
      const condition1 = this.filterModelEntryToSearchQuery(key, filterModel['condition1']);
      const condition2 = this.filterModelEntryToSearchQuery(key, filterModel['condition2']);
      return `${condition1} ${filterModel['operator']} ${condition2}`;
    }

    return '';
  }

  private escapeFilterString(searchQuery: string): string {
    const escapedChars = ['\\', '*', '?', '+', '-', '&&', '||', '!', '(', ')', '{', '}', '[', ']', '^', '~', ':', '"', '=', '/', ' '];
    escapedChars.forEach(char => {
      searchQuery = searchQuery.split(char).join('\\' + char);
    });

    const removedChars = ['<', '>'];
    removedChars.forEach(char => {
      searchQuery = searchQuery.split(char).join('');
    });

    return searchQuery;
  }
}
