import {
  ChangeDetectionStrategy,
  Component, inject
} from '@angular/core';
import {
  URICellRendererComponent,
  DatatableColumn
} from '@kotka/ui/datatable';
import { DatatableLoadedData, DocumentDatatableComponent } from '@kotka/ui/document-datatable';
import { KotkaDocumentObjectType } from '@kotka/shared/models';
import { MainContentComponent } from '@kotka/ui/main-content';
import { FormsModule } from '@angular/forms';
import { SearchParams, SearchResultIteratorService } from '@kotka/ui/services';

@Component({
  selector: 'kotka-specimen-table',
  templateUrl: './specimen-table.component.html',
  styleUrls: ['./specimen-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MainContentComponent, FormsModule, DocumentDatatableComponent],
})
export class SpecimenTableComponent{
  private searchResultIteratorService = inject(SearchResultIteratorService);

  dataType: KotkaDocumentObjectType.specimen = KotkaDocumentObjectType.specimen;

  columns: DatatableColumn[] = [
    {
      headerName: 'URI',
      field: 'id',
      cellRenderer: URICellRendererComponent,
      cellRendererParams: {
        routerLink: ['..', 'edit']
      },
      width: 145,
      flex: 0,
      lockPosition: 'left',
      defaultSelected: true
    }
  ];

  onDataLoad(data: DatatableLoadedData) {
    const searchParams: SearchParams = {
      sort: data.searchParams.sort,
      searchQueryString: data.searchParams.searchQueryString,
      searchQueryObject: data.searchParams.searchQueryObject
    };
    this.searchResultIteratorService.setSearchParams(this.dataType, searchParams, true);
  }
}
