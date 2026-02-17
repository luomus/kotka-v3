import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  URICellRendererComponent,
  DatatableColumn
} from '@kotka/ui/datatable';
import { DatatableLoadedData, DocumentDatatableComponent } from '@kotka/ui/document-datatable';
import { KotkaDocumentObjectType, Document } from '@kotka/shared/models';
import { MainContentComponent } from '@kotka/ui/main-content';
import { FormsModule } from '@angular/forms';
import {
  ApiClient,
  SearchParams,
  SearchResultIteratorService,
} from '@kotka/ui/services';
import { SpecimenLabelDesignerComponent } from '../specimen-label-designer/specimen-label-designer.component';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { SpinnerComponent } from '@kotka/ui/spinner';

@Component({
  selector: 'kotka-specimen-table',
  templateUrl: './specimen-table.component.html',
  styleUrls: ['./specimen-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MainContentComponent,
    FormsModule,
    DocumentDatatableComponent,
    SpecimenLabelDesignerComponent,
    AsyncPipe,
    SpinnerComponent,
  ],
})
export class SpecimenTableComponent {
  private apiClient = inject(ApiClient);
  private searchResultIteratorService = inject(SearchResultIteratorService);

  dataType: KotkaDocumentObjectType.specimen = KotkaDocumentObjectType.specimen;

  columns: DatatableColumn[] = [
    {
      headerName: 'URI',
      field: 'id',
      cellRenderer: URICellRendererComponent,
      cellRendererParams: {
        routerLink: ['..', 'edit'],
      },
      width: 145,
      flex: 0,
      lockPosition: 'left',
      defaultSelected: true,
    },
  ];

  showLabelDesigner = signal(false);
  labelDesignerData$?: Observable<Document[]>;

  private searchParams?: SearchParams;

  constructor() {
    effect(() => {
      if (this.showLabelDesigner()) {
        const searchParams = this.searchParams;
        this.labelDesignerData$ = this.apiClient
          .getAllDocuments(
            this.dataType,
            1000,
            searchParams?.sort,
            searchParams?.searchQueryString,
            undefined,
            searchParams?.searchQueryObject,
          );
      } else {
        this.labelDesignerData$ = undefined;
      }
    });
  }

  onDataLoad(data: DatatableLoadedData) {
    const searchParams: SearchParams = {
      sort: data.searchParams.sort,
      searchQueryString: data.searchParams.searchQueryString,
      searchQueryObject: data.searchParams.searchQueryObject,
    };

    this.searchParams = searchParams;

    this.searchResultIteratorService.setSearchParams(
      this.dataType,
      searchParams,
      true,
    );
  }
}
