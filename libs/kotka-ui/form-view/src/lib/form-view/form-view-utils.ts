import { JSONPath } from 'jsonpath-plus';
import { cloneDeep } from 'lodash';
import { KotkaDocumentObject } from '@kotka/shared/models';

export class FormViewUtils {
  static removeMetaAndExcludedFields<S extends KotkaDocumentObject>(data: Partial<S>, excludedFields: string[] = []): Partial<S> {
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

  private static removeMetaFieldsRecursively(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map(FormViewUtils.removeMetaFieldsRecursively);
    } else if (typeof data === 'object') {
      const objectData = data as Record<string, unknown>;
      Object.keys(objectData).map(key => {
        if (key.startsWith('@')) {
          delete objectData[key];
          return;
        }
        FormViewUtils.removeMetaFieldsRecursively(objectData[key]);
      });
    }

    return data;
  }
}
