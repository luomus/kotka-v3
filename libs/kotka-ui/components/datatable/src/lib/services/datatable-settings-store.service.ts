import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { ColDefWithExtra, ColumnSettings, DatatableFilter } from '../models/models';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class DatatableSettingsStoreService {
  constructor(private storage: LocalStorageService) {}

  getStoredColumnSettings(settingsKey: string|undefined, defaultSettings: ColumnSettings): ColumnSettings|undefined {
    if (settingsKey) {
      const settings = this.storage.retrieve(settingsKey + '-columns');
      if (settings) {
        return this.getCleanedColumnSettings(settings, defaultSettings);
      }
    }
    return undefined;
  }

  storeColumnSettings(settingsKey: string|undefined, columnSettings: ColumnSettings) {
    if (settingsKey) {
      this.storage.store(settingsKey + '-columns', columnSettings);
    }
  }

  getStoredFilters(settingsKey: string|undefined): DatatableFilter {
    if (!settingsKey) {
      return {};
    }

    return this.storage.retrieve(settingsKey + '-filters') || {};
  }

  storeFilters(
    settingsKey: string|undefined,
    filterModel: DatatableFilter,
    allColumns: ColDefWithExtra[],
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

  private getCleanedColumnSettings(settings: ColumnSettings, defaultSettings: ColumnSettings): ColumnSettings {
    let { selected, order } = settings;
    const allColIds = defaultSettings.order;

    if (selected) {
      selected = selected.filter((colId) => allColIds.includes(colId));
    } else {
      selected = defaultSettings.selected;
    }

    if (order) {
      order = order.filter((colId) => allColIds.includes(colId)) as string[];

      allColIds.forEach((colId, idx) => {
        if (!order!.includes(colId)) {
          order!.splice(idx, 0, colId);
        }
      });
    } else {
      order = defaultSettings.order;
    }

    return { selected, order };
  }
}
