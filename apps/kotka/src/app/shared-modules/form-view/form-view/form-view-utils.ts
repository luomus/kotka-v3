import { JSONPath } from 'jsonpath-plus';
import { cloneDeep } from 'lodash';
import { KotkaObject, KotkaObjectType } from '@kotka/api-interfaces';

export class FormViewUtils {
  static getIdFromDataURI(dataURI: string): string {
    return dataURI.split('/').pop() as string;
  }

  static removeMetaAndExcludedFields<T extends KotkaObjectType>(data: Partial<KotkaObject<T>>, excludedFields: string[] = []): Partial<KotkaObject<T>> {
    data = cloneDeep(data);

    let removedFields = ['$.id', '$.dateCreated', '$.dateEdited', '$.creator', '$.editor'];
    removedFields = [...removedFields, ...excludedFields || []];

    removedFields.forEach(path => JSONPath({
        json: data, path, callback: (v, t, payload) => {
          delete payload.parent[payload.parentProperty];
        }
      })
    );

    FormViewUtils.removeMetaFieldsRecursively(data);

    return data;
  }

  private static removeMetaFieldsRecursively(data: any): any {
    if (Array.isArray(data)) {
      return data.map(FormViewUtils.removeMetaFieldsRecursively);
    } else if (typeof data === 'object') {
      Object.keys(data).map(key => {
        if (key.startsWith('@')) {
          delete data[key];
          return;
        }
        FormViewUtils.removeMetaFieldsRecursively(data[key]);
      });
    }

    return data;
  }
}
