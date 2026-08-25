import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@kotka/ui/core';
import { SchemaService } from '@luomus/label-designer';
import { map, Observable } from 'rxjs';
import { DatatableColumn } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class DocumentDatatableColumnService {
  private apiClient = inject(ApiClient);
  private schemaService = inject(SchemaService);

  getColumnsFromFormSchema(formId: string): Observable<DatatableColumn[]> {
    return this.apiClient.getForm(formId).pipe(
      map((form) =>
        form
          ? this.schemaService.schemaToAvailableFields(form.schema, [], {
              skip: [],
            })
          : [],
      ),
      map((fields) =>
        fields.map((field) => ({
          headerName: field.label,
          field: field.field,
        })),
      ),
    );
  }
}
