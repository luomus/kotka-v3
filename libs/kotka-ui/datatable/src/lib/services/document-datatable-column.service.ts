import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@kotka/ui/core';
import { ILabelField, SchemaService } from '@luomus/label-designer';
import { map, Observable } from 'rxjs';
import { DatatableColumn } from '../models/models';
import {
  getAutocompleteColumnOptions,
  getBooleanColumnOptions,
  getDateColumnOptions,
  getEnumColumnOptions, getUriColumnOptions,
} from './document-datatable-column-utils';
import { URICellRendererParams } from '../renderers/uri-cell-renderer.component';
import { AutocompleteFilterParams } from '../filters/autocomplete-floating-filter.component';

export type SpecialColumnType =
  | 'uri'
  | 'autocomplete'
  | 'boolean'
  | 'date';

export type SpecialColumnConfig = {
  type: 'uri';
  params?: URICellRendererParams;
} | {
  type: 'autocomplete';
  params: AutocompleteFilterParams;
} | {
  type: Extract<SpecialColumnType, 'boolean' | 'date'>;
  params?: undefined;
};

export type SpecialColumns = Record<string, Exclude<SpecialColumnType, 'autocomplete'> | SpecialColumnConfig>;

@Injectable({
  providedIn: 'root',
})
export class DocumentDatatableColumnService {
  private apiClient = inject(ApiClient);
  private schemaService = inject(SchemaService);

  getColumnsFromFormSchema(
    formId: string,
    specialColumns: SpecialColumns = {},
  ): Observable<DatatableColumn[]> {
    return this.apiClient.getForm(formId).pipe(
      map((form) =>
        form
          ? this.schemaService.schemaToAvailableFields(form.schema, [], {
              skip: [],
            })
          : [],
      ),
      map((fields) =>
        fields.map((field) => this.getColumn(field, specialColumns)),
      ),
    );
  }

  private getColumn(
    field: ILabelField,
    specialColumns: SpecialColumns,
  ): DatatableColumn {
    const basicColumn = {
      headerName: field.label,
      field: field.field,
    };

    const specialColumn = specialColumns[field.field];
    const config: SpecialColumnConfig = typeof specialColumn === 'string' ? { type: specialColumn } : specialColumn;

    if (config?.type === 'uri') {
      return {
        ...basicColumn,
        ...getUriColumnOptions(config.params),
      };
    } else if (config?.type === 'autocomplete') {
      return {
        ...basicColumn,
        ...getAutocompleteColumnOptions(config.params.type),
      };
    } else if (config?.type === 'boolean') {
      return {
        ...basicColumn,
        ...getBooleanColumnOptions(),
      };
    } else if (config?.type === 'date') {
      return {
        ...basicColumn,
        ...getDateColumnOptions(),
      };
    } else if (field.valueMap) {
      return {
        ...basicColumn,
        ...getEnumColumnOptions(field.valueMap),
      };
    } else {
      return basicColumn;
    }
  }
}
