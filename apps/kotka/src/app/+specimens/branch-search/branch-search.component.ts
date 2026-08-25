import {
  ChangeDetectionStrategy,
  Component, inject
} from '@angular/core';
import {
  DatatableColumn,
  DocumentDatatableComponent,
  DocumentDatatableColumnService,
  SpecialColumns, getUriColumnOptions,
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
      ...getUriColumnOptions({
        showEditLink: false,
        showViewLink: true,
        viewRouterLink: ['/accessions'],
        getViewRouterQueryParams: (data: Branch) => ({
          uri: getUri(data.accessionID),
        }),
      }),
      lockPosition: 'left',
      defaultSelected: true,
    },
  ];
  private specialColumns: SpecialColumns = {
    'accessionID': {
      type: 'uri',
      params: { showEditLink: false, showViewLink: true, viewRouterLink: ['/view'] },
    },
    'collectionID': { type: 'autocomplete', params: { type: 'collection' } },
    'exists': 'boolean',
    'events.date': 'date'
  };

  constructor() {
    this.columns$ = this.columnService.getColumnsFromFormSchema(globals.branchFormId, this.specialColumns).pipe(
      map(columns => ([...this.customColumns, ...columns]))
    );
  }
}
