import { Injectable } from '@angular/core';
import { isEqual } from 'lodash';
import { ColumnSettings, DatatableColumn } from '@kotka/shared/models';
import { LocalStorage } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root'
})
export class DatatableColumnSettingsService {
  @LocalStorage('datatable-settings', {}) private settings!: Record<string, ColumnSettings>;

  getSettings(settingsKey: string|undefined): ColumnSettings {
    if (!settingsKey) {
      throw Error('A settingsKey should be provided when the enableColumnSelection options is on');
    }

    if (!this.settings[settingsKey]) {
      this.settings[settingsKey] = {};
    }

    return this.settings[settingsKey];
  }

  setSettings(settingsKey: string|undefined, columnSettings: ColumnSettings) {
    if (!settingsKey) {
      throw Error('A settingsKey should be provided when the enableColumnSelection options is on');
    }

    this.settings = { ...this.settings, [settingsKey]: columnSettings };
  }

  cleanSettings(settingsKey: string|undefined, allColumns: DatatableColumn[]) {
    const settings = this.getSettings(settingsKey);
    const allColIds: string[] = allColumns.map(col => col.colId!);

    let { selected, order } = settings;

    if (selected) {
      selected = selected.filter(colId => allColIds.includes(colId));
    }

    if (order) {
      order = order.filter(colId => allColIds.includes(colId)) as string[];

      allColIds.forEach((colId, idx) => {
        if (!order!.includes(colId)) {
          order!.splice(idx, 0, colId);
        }
      });
    }

    this.setSettings(settingsKey, { selected, order });
  }

  updateSelected(settingsKey: string|undefined, selected: string[]) {
    if (isEqual(selected, this.getSettings(settingsKey).selected)) {
      return;
    }

    const order = this.getSettings(settingsKey).order;

    if (order) {
      const getSortIndex = (value: string): number => {
        let index = selected.indexOf(value);
        if (index === -1) {
          index = selected.length;
        }
        return index;
      };

      order.sort((valueA, valueB) => (
        getSortIndex(valueA) - getSortIndex(valueB)
      ));
    }

    this.setSettings(settingsKey, { selected, order });
  }
}
