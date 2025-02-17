import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { DatatableColumn, DatatableFilter } from '@kotka/shared/models';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class DatatableFilterStoreService {
  constructor(
    private storage: LocalStorageService
  ) {}

  getFilters(settingsKey: string|undefined): DatatableFilter|null {
    if (!settingsKey) {
      return null;
    }

    return this.storage.retrieve(settingsKey + '-filters');
  }

  updateFilters(settingsKey: string|undefined, filterModel: DatatableFilter, allColumns: DatatableColumn[]) {
    if (!settingsKey) {
      return;
    }

    const columnFilters: DatatableFilter = {};
    Object.keys(filterModel).forEach(colId => {
      const col = allColumns.filter(col => col.colId === colId)[0];
      if (col?.rememberFilters) {
        columnFilters[colId] = cloneDeep(filterModel[colId]);
      }
    });

    this.storage.store(settingsKey + '-filters', columnFilters);
  }
}
