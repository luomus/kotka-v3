import { inject, Injectable } from '@angular/core';
import { ApiClient, toMap } from '@kotka/ui/core';
import {
  BOOLEAN_TYPES,
  DATE_TYPES,
  GEO_POINT_TYPES,
  IndexType,
  KotkaDocumentType,
  SearchField, SearchResult, SearchResultKey,
} from '@kotka/shared/models';
import { Observable } from 'rxjs';
import { FieldData } from '../models/models';
import { ColDefWithExtra, DatatableColumn, getBooleanColumnOptions, getDateColumnOptions, getGeoPointColumnOptions,
  getUriColumnOptions
} from '@kotka/ui/datatable';
import { map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FieldDataService {
  private apiClient = inject(ApiClient);

  getFieldData(
    index: IndexType,
    defaultSelectedFields: string[],
    onRowSelect: (data: any) => void,
  ): Observable<FieldData> {
    const specialColumns: Record<string, DatatableColumn> =
      this.getSpecialColumns(onRowSelect);

    return this.apiClient
      .getSearchFields(KotkaDocumentType.specimen, index)
      .pipe(
        map((fields) => {
          const fieldMap: Record<string, SearchField> = toMap(fields, 'field');

          const columns: DatatableColumn[] = fields.map((field) => {
            let baseColumn: Partial<DatatableColumn> = {};
            if (DATE_TYPES.includes(field.type)) {
              baseColumn = getDateColumnOptions();
            } else if (BOOLEAN_TYPES.includes(field.type)) {
              baseColumn = getBooleanColumnOptions();
            } else if (GEO_POINT_TYPES.includes(field.type)) {
              baseColumn = getGeoPointColumnOptions();
            }

            return {
              headerName: field.label || field.field,
              field: field.field,
              sortField: field.hasRaw ? `${field.field}.raw` : field.field,
              ...baseColumn,
              ...(specialColumns[field.field] || {}),
              defaultSelected: defaultSelectedFields.includes(field.field),
            };
          });

          const allAggregateColumns: ColDefWithExtra[] = fields
            .filter((field) => field.hasRaw || field.type === 'keyword')
            .map((field) => ({
              colId: field.field,
              headerName: field.label || field.field,
              field: field.field,
            }));

          const allAggregateFields: string[] = allAggregateColumns.map(
            (col) => col.colId,
          );

          return {
            fields,
            fieldMap,
            columns,
            allAggregateColumns,
            allAggregateFields,
            fieldsLoading: false,
          };
        }),
        startWith({ fieldsLoading: true }),
      );
  }

  private getSpecialColumns(
    onRowSelect: (data: any) => void,
  ): Partial<Record<SearchResultKey, DatatableColumn>> {
    return {
      documentURI: {
        ...getUriColumnOptions({
          editRouterLink: ['..', 'edit'],
          showViewLink: true,
          getEditRouterQueryParams: (data: SearchResult) => ({
            uri: data.documentURI,
            sortId: data.id,
          }),
          getViewRouterQueryParams: (data: SearchResult) => ({
            uri: data.documentURI,
            sortId: data.id,
          }),
          onRowSelect,
        }),
        lockPosition: 'left',
      },
      dateCreated: getDateColumnOptions(true, true),
      dateEdited: getDateColumnOptions(true, true),
    };
  }
}
