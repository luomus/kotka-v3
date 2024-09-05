import { Injectable } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { DatatableColumn, FilterModel } from '@kotka/shared/models';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class DatatableFilterStoreService {
  @LocalStorage('datatable-filters', {}) private filters!: Record<string, FilterModel>;

  getFilters(settingsKey: string|undefined): FilterModel {
    if (!settingsKey) {
      return {};
    }

    return this.filters[settingsKey] || {};
  }

  updateFilters(settingsKey: string|undefined, filterModel: FilterModel, allColumns: DatatableColumn[]) {
    if (!settingsKey) {
      return;
    }

    const columnFilters: FilterModel = {};
    Object.keys(filterModel).forEach(colId => {
      const col = allColumns.filter(col => col.colId === colId)[0];
      if (col?.rememberFilters) {
        columnFilters[colId] = cloneDeep(filterModel[colId]);
      }
    });

    this.filters = { ...this.filters, [settingsKey]: columnFilters };
  }
}
