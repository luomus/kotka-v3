import { Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { JSONSchema7 } from 'json-schema';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { FormlyJsonschemaOptions } from '@ngx-formly/core/json-schema/formly-json-schema.service';
import { isObservable, of } from 'rxjs';

export interface LuomusJsonschemaOptions extends FormlyJsonschemaOptions {
  labelClassName?: string;
  inputClassName?: string;
  rowClassName?: string;
}

@Injectable({ providedIn: 'root' })
export class LuomusJsonschema extends FormlyJsonschema {
  toFieldConfig(
    schema: JSONSchema7,
    options?: LuomusJsonschemaOptions
  ): FormlyFieldConfig {
    return super.toFieldConfig(schema, {
      ...(options || {}),
      map: (mappedField, mapSource) => {
        if (!mappedField.templateOptions) {
          mappedField.templateOptions = {};
        }

        // Add input type according to the format
        if (mapSource.type === 'string' && mapSource.format) {
          mappedField.templateOptions.type = mapSource.format;
        }

        // Add label, input and  wrapper classes
        if (!mappedField.templateOptions.labelClassName) {
          mappedField.templateOptions.labelClassName =
            options?.labelClassName || 'col-sm-5 text-sm-right';
        }
        if (!mappedField.templateOptions.inputClassName) {
          mappedField.templateOptions.inputClassName =
            options?.inputClassName || 'col-sm-7';
        }
        if (!mappedField.templateOptions.rowClassName) {
          mappedField.templateOptions.rowClassName =
            options?.rowClassName || 'form-group row';
        }

        if (options?.map) {
          mappedField = options.map(mappedField, mapSource);
        }

        // Make the options observable always and add the label names from form schema
        if (
          mappedField.templateOptions?.options &&
          !isObservable(mappedField.templateOptions.options)
        ) {
          mappedField.templateOptions.options = of(
            mappedField.templateOptions.options.map((option, idx) => ({
              ...option,
              label: (mapSource as any)?.enumNames?.[idx] || option.label,
            })) as any[]
          );
        }

        return mappedField;
      },
    });
  }
}
