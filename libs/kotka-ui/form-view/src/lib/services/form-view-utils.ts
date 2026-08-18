import { JSONPath } from 'jsonpath-plus';
import { cloneDeep } from 'lodash';
import { ApiValidationError, KotkaDocument } from '@kotka/shared/models';
import { ErrorSchema } from '@rjsf/utils';

export class FormViewUtils {
  static removeMetaAndExcludedFields<S extends KotkaDocument>(
    data: Partial<S>,
    excludedFields: string[] = [],
  ): Partial<S> {
    data = cloneDeep(data);

    let removedFields = [
      '$.id',
      '$.dateCreated',
      '$.dateEdited',
      '$.creator',
      '$.editor',
    ];
    removedFields = [...removedFields, ...(excludedFields || [])];

    removedFields.forEach((path) =>
      JSONPath({
        json: data,
        path,
        callback: (v, t, payload) => {
          delete payload.parent[payload.parentProperty];
        },
      }),
    );

    FormViewUtils.removeMetaFieldsRecursively(data);

    return data;
  }

  static apiValidationErrorsToRJSFErrorSchema = (error: ApiValidationError): ErrorSchema => {
    const errorSchema: ErrorSchema = {};

    for (const property of Object.keys(error.details)) {
      const segments = property.replace(/^\//, '').split('/');
      let current: ErrorSchema = errorSchema;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (i === segments.length - 1) {
          current[segment] = { ...current[segment], __errors: error.details[property] } as ErrorSchema;
        } else {
          current[segment] = current[segment] || {};
          current = current[segment];
        }
      }
    }

    return errorSchema;
  };

  private static removeMetaFieldsRecursively(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map(FormViewUtils.removeMetaFieldsRecursively);
    } else if (typeof data === 'object') {
      const objectData = data as Record<string, unknown>;
      Object.keys(objectData).map((key) => {
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
