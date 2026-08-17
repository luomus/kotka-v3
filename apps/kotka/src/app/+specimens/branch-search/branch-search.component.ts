import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import {
  URICellRendererComponent,
  DatatableColumn,
  DocumentDatatableComponent,
} from '@kotka/ui/datatable';
import { KotkaRootDocumentType } from '@kotka/shared/models';
import { MainContentComponent } from '@kotka/ui/components';
import { FormsModule } from '@angular/forms';
import { getUri } from '@kotka/shared/utils';
import { Branch } from '@luomus/laji-schema';

@Component({
  selector: 'kotka-branch-search',
  templateUrl: './branch-search.component.html',
  styleUrls: ['./branch-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MainContentComponent, FormsModule, DocumentDatatableComponent],
})
export class BranchSearchComponent {
  dataType: KotkaRootDocumentType.branch = KotkaRootDocumentType.branch;

  columns: DatatableColumn[] = [
    {
      headerName: 'URI',
      field: 'id',
      cellRenderer: URICellRendererComponent,
      cellRendererParams: {
        showEditLink: false,
        showViewLink: true,
        viewRouterLink: ['/accessions'],
        getViewRouterQueryParams: (data: Branch) => ({ uri: getUri(data.accessionID) })
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
}
