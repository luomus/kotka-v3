import { SortModel } from '../../../../../../libs/kotka/ui/datatable/src';
import { Observable } from 'rxjs';
import { ListResponse } from '@kotka/shared/models';
import { DataObject, DataService, DataType } from './data.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class DatatableDataService {
  constructor(
    private dataService: DataService
  ) {}

  getData(dataType: DataType, startRow: number, endRow: number, sortModel: SortModel[], filterModel: any): Observable<ListResponse<DataObject>> {
    const pageSize = endRow - startRow;
    const page = (startRow / pageSize) + 1;
    const sort = this.sortModelToSortString(sortModel);
    const searchQuery = this.filterModelToSearchQuery(filterModel);
    return this.dataService.getData(dataType, page, pageSize, sort, searchQuery);
  }

  private sortModelToSortString(sortModel: SortModel[]): string {
    return sortModel.map(sort => sort.colId + ' ' + sort.sort).join(',');
  }

  private filterModelToSearchQuery(filterModel: any): string {
    return Object.keys(filterModel).map(
      key => this.filterModelEntryToSearchQuery(key, filterModel[key])
    ).join(' AND ');
  }

  private filterModelEntryToSearchQuery(key: string, filterModel: any): string {
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
