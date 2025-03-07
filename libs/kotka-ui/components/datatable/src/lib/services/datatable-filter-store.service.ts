import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { DatatableColumnWithId, DatatableFilter } from '../models/models';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class DatatableFilterStoreService {
  constructor(private storage: LocalStorageService) {}

  getFilters(settingsKey: string | undefined): DatatableFilter {
    if (!settingsKey) {
      return {};
    }

    return this.storage.retrieve(settingsKey + '-filters') || {};
  }

  updateFilters(
    settingsKey: string | undefined,
    filterModel: DatatableFilter,
    allColumns: DatatableColumnWithId[],
  ) {
    if (!settingsKey) {
      return;
    }

    const columnFilters: DatatableFilter = {};
    allColumns.forEach(col => {
      if (col?.rememberFilters) {
        columnFilters[col.colId] = cloneDeep(filterModel[col.colId] || null);
      }
    });

    if (Object.keys(columnFilters).length > 0) {
      this.storage.store(settingsKey + '-filters', columnFilters);
    }
  }
}
