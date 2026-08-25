import {
  ChangeDetectionStrategy,
  Component, inject
} from '@angular/core';
import {
  URICellRendererComponent,
  DatatableColumn,
  DocumentDatatableComponent,
  DocumentDatatableColumnService,
} from '@kotka/ui/datatable';
import { KotkaDocumentType } from '@kotka/shared/models';
import { MainContentComponent } from '@kotka/ui/components';
import { FormsModule } from '@angular/forms';
import { getUri } from '@kotka/shared/utils';
import { Branch } from '@luomus/laji-schema';
import { globals } from '../../../environments/globals';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs/operators';

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
  private columnService = inject(DocumentDatatableColumnService);

  dataType: KotkaDocumentType.branch = KotkaDocumentType.branch;

  columns$: Observable<DatatableColumn[]>;

  private customColumns: DatatableColumn[] = [
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
  ];

  constructor() {
    this.columns$ = this.columnService.getColumnsFromFormSchema(globals.branchFormId).pipe(
      map(columns => ([...this.customColumns, ...columns])),
    );
  }
}
