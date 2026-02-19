import { Patch } from '@kotka/shared/models';

export const alignArrayWithPatchArray = (data: any[] | undefined, patches: Patch[] | undefined): any[] => {
  if (!data) {
    return data || [];
  }

  const result = [...data];

  let itemsAddedToMiddle = 0;

  (patches || []).forEach((value, idx) => {
    const newIdx = idx + itemsAddedToMiddle;

    if (value?.op === 'add' && (result[newIdx] || newIdx >= result.length)) {
      result.splice(newIdx, 0, undefined);
      if (idx < data.length) {
        itemsAddedToMiddle++;
      }
    }
  });

  return result;
};

export const alignPatchArrayWithArray = (patches: Patch[] | undefined, data: any[] | undefined): Patch[] => {
  if (!data) {
    return patches || [];
  }

  const result: Patch[] = [];

  let itemsAddedToMiddle = 0;

  return (patches || []).reduce((res, value, idx) => {
    res[idx + itemsAddedToMiddle] = value;

    if (value.op === 'add' && idx < data.length) {
      itemsAddedToMiddle++;
    }

    return res;
  }, result);
};
