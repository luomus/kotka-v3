import { Injectable } from '@angular/core';
import { isEqual } from 'lodash';
import { ColumnSettings, DatatableColumnWithId } from '../models/models';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root',
})
export class DatatableColumnSettingsService {
  constructor(private storage: LocalStorageService) {}

  getSettings(settingsKey: string | undefined): ColumnSettings {
    if (!settingsKey) {
      throw Error(
        'A settingsKey should be provided when the enableColumnSelection options is on',
      );
    }

    return this.storage.retrieve(settingsKey + '-columns') || {};
  }

  setSettings(settingsKey: string | undefined, columnSettings: ColumnSettings) {
    if (!settingsKey) {
      throw Error(
        'A settingsKey should be provided when the enableColumnSelection options is on',
      );
    }

    this.storage.store(settingsKey + '-columns', columnSettings);
  }

  cleanSettings(
    settingsKey: string | undefined,
    allColumns: DatatableColumnWithId[],
  ) {
    const settings = this.getSettings(settingsKey);
    const allColIds: string[] = allColumns.map((col) => col.colId);

    let { selected, order } = settings;

    if (selected) {
      selected = selected.filter((colId) => allColIds.includes(colId));
    }

    if (order) {
      order = order.filter((colId) => allColIds.includes(colId)) as string[];

      allColIds.forEach((colId, idx) => {
        if (!order!.includes(colId)) {
          order!.splice(idx, 0, colId);
        }
      });
    }

    this.setSettings(settingsKey, { selected, order });
  }

  updateSelected(settingsKey: string | undefined, selected: string[]) {
    const settings = this.getSettings(settingsKey);

    if (isEqual(selected, settings.selected)) {
      return;
    }

    const order = settings.order;

    if (order) {
      const getSortIndex = (value: string): number => {
        let index = selected.indexOf(value);
        if (index === -1) {
          index = selected.length;
        }
        return index;
      };

      order.sort(
        (valueA, valueB) => getSortIndex(valueA) - getSortIndex(valueB),
      );
    }

    this.setSettings(settingsKey, { selected, order });
  }
}
