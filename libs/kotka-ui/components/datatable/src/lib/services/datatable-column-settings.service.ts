import { Injectable } from '@angular/core';
import { ColumnSettings, ColDefWithExtra } from '../models/models';
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
    allColumns: ColDefWithExtra[],
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

  updateSelectedAfterColumnMove(settingsKey: string | undefined, selected: string[], colId: string) {
    const settings = this.getSettings(settingsKey);

    let order = settings.order;

    if (order) {
      order = this.getOrderAfterColumnMove(order, selected, colId);
    }

    this.setSettings(settingsKey, { selected, order });
  }

  private getOrderAfterColumnMove(order: string[], selected: string[], colId: string): string[] {
    order = [...order];

    const oldSelectedIdx = order.filter(colId => selected.includes(colId)).indexOf(colId);
    const newSelectedIdx = selected.indexOf(colId);

    const oldOrderIdx = order.indexOf(colId);
    let newOrderIndex = oldOrderIdx;

    if (newSelectedIdx < oldSelectedIdx) {
      newOrderIndex = order.indexOf(selected[newSelectedIdx + 1]);
    } else if (newSelectedIdx > oldSelectedIdx) {
      newOrderIndex = order.indexOf(selected[newSelectedIdx - 1]);
    }

    if (newOrderIndex !== oldOrderIdx) {
      order.splice(newOrderIndex, 0, order.splice(oldOrderIdx, 1)[0]);
    }

    return order;
  }
}
