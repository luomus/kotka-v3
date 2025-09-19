import { getUUID } from '@luomus/laji-form/lib/utils';
import { isEqual } from 'lodash';

export const getRequiredFields = (schema: any, path = '/'): string[] => {
  let results: string[] = [];
  if (schema.type === 'object' && schema.required) {
    results = results.concat(schema.required.map((field: string[]) => (path + field)));
  }
  if (schema.type === 'object' && schema.properties) {
    Object.keys(schema.properties).forEach((prop: string) => {
      results = results.concat(getRequiredFields(schema.properties[prop], path + prop + '/'));
    });
  } else if (schema.type === 'array' && schema.items) {
    results = results.concat(getRequiredFields(schema.items, path));
  }
  return results;
};

export const formDataItemsAreEqual = (item1: any, item2: any): boolean => {
  const item1Id = getUUID(item1);
  const item2Id = getUUID(item2);
  if (item1Id !== undefined || item2Id !== undefined) {
    return item1Id === item2Id;
  }
  return isEqual(item1, item2);
};
