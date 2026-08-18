import {
  ChangeDetectionStrategy,
  Component, inject
} from '@angular/core';
import {
  URICellRendererComponent,
  DatatableColumn,
  DocumentDatatableComponent,
} from '@kotka/ui/datatable';
import { KotkaDocumentType } from '@kotka/shared/models';
import { MainContentComponent } from '@kotka/ui/components';
import { FormsModule } from '@angular/forms';
import { getUri } from '@kotka/shared/utils';
import { Branch } from '@luomus/laji-schema';
import { globals } from '../../../environments/globals';
import { map, Observable } from 'rxjs';
import { ApiClient } from '@kotka/ui/core';
import { SchemaService } from '@luomus/label-designer';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'kotka-branch-search',
  templateUrl: './branch-search.component.html',
  styleUrls: ['./branch-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MainContentComponent,
    FormsModule,
    DocumentDatatableComponent,
    AsyncPipe,
  ],
})
export class BranchSearchComponent {
  private apiClient = inject(ApiClient);
  private schemaService = inject(SchemaService);

  dataType: KotkaDocumentType.branch = KotkaDocumentType.branch;

  columns: DatatableColumn[] = [
    {
      headerName: 'URI',
      field: 'id',
      cellRenderer: URICellRendererComponent,
      cellRendererParams: {
        showEditLink: false,
        showViewLink: true,
        viewRouterLink: ['/accessions'],
        getViewRouterQueryParams: (data: Branch) => ({
          uri: getUri(data.accessionID),
        }),
      },
      width: 145,
      flex: 0,
      lockPosition: 'left',
      defaultSelected: true,
      cellStyle: { lineHeight: 'normal' },
    },
    {
      headerName: 'Location',
      field: 'location',
      defaultSelected: true,
    },
  ];

  columns$: Observable<DatatableColumn[]>;

  constructor() {
    this.columns$ = this.apiClient.getForm(globals.branchFormId).pipe(
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
