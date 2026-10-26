import { ColumnSettings } from '../models/models';

export function getCleanedColumnSettings(settings: ColumnSettings, defaultSettings?: ColumnSettings, lockedCols?: string[]): ColumnSettings {
  if (!defaultSettings || !lockedCols) {
    return settings;
  }

  let { selected, order } = settings;
  const allColIds = defaultSettings.order;

  if (selected) {
    selected = selected.filter((colId) => allColIds.includes(colId));
  } else {
    selected = [...defaultSettings.selected];
  }

  if (order) {
    order = order.filter((colId) => allColIds.includes(colId)) as string[];

    allColIds.forEach((colId, idx) => {
      if (!order!.includes(colId)) {
        order!.splice(idx, 0, colId);
      }
    });
  } else {
    order = [...defaultSettings.order];
  }

  for (const colId of lockedCols) {
    if (!selected.includes(colId)) {
      selected.push(colId);
    }

    const currentIdx = order.indexOf(colId);
    const lockedIdx = allColIds.indexOf(colId);
    moveInArray(order, currentIdx, lockedIdx);
  }

  sortByOrder(selected, order);

  return { selected, order };
}

export function sortByOrder(selected: string[], order: string[]) {
  selected.sort((colIdA, colIdB) => order.indexOf(colIdA) - order.indexOf(colIdB));
}

export function moveInArray(arr: any[], fromIndex: number, toIndex: number): void {
  if (fromIndex === toIndex) {
    return;
  }

  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}
