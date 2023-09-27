import { JSONPath } from 'jsonpath-plus';
import { cloneDeep } from 'lodash';
import { DataObject } from '../../../shared/services/api-services/data.service';

export class FormViewUtils {
  static removeMetaAndExcludedFields(data: Partial<DataObject>, excludedFields: string[] = []): Partial<DataObject> {
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
