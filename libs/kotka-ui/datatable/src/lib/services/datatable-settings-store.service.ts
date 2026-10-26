import { Injectable, inject } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { ColDefWithExtra, ColumnSettings, DatatableFilter } from '../models/models';
import { cloneDeep } from 'lodash';
import { getCleanedColumnSettings } from './datatable-settings-utls';

@Injectable({
  providedIn: 'root',
})
export class DatatableSettingsStoreService {
  private storage = inject(LocalStorageService);

  getStoredColumnSettings(settingsKey: string, defaultSettings?: ColumnSettings, lockedCols?: string[]): ColumnSettings | undefined {
    if (settingsKey && defaultSettings && lockedCols) {
      const settings = this.storage.retrieve(settingsKey + '-columns');
      if (settings) {
        return getCleanedColumnSettings(settings, defaultSettings, lockedCols);
      }
    }
    return undefined;
  }

  storeColumnSettings(settingsKey: string, columnSettings?: ColumnSettings) {
    if (settingsKey && columnSettings) {
      this.storage.store(settingsKey + '-columns', columnSettings);
    }
  }

  getStoredFilters(settingsKey: string): DatatableFilter {
    if (!settingsKey) {
      return {};
    }

    return this.storage.retrieve(settingsKey + '-filters') || {};
  }

  storeFilters(
    settingsKey: string,
    filterModel?: DatatableFilter,
    allColumns?: ColDefWithExtra[],
  ) {
    if (!settingsKey || !filterModel || !allColumns) {
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
