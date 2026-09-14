import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  URICellRendererComponent,
  DatatableColumn,
  DatatableLoadedData,
  DocumentDatatableComponent,
} from '@kotka/ui/datatable';
import { KotkaDocumentType, Document, IndexType } from '@kotka/shared/models';
import { MainContentComponent, SpinnerComponent } from '@kotka/ui/components';
import { FormsModule } from '@angular/forms';
import {
  ApiClient,
  IteratorSearchParams,
  SearchResultIteratorService,
} from '@kotka/ui/core';
import { SpecimenLabelDesignerComponent } from '../specimen-label-designer/specimen-label-designer.component';
import { Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { map, startWith, switchMap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

interface ViewModel {
  index: IndexType | undefined;
  columns: DatatableColumn[];
  columnsLoading: boolean;
}

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

  dataType: KotkaDocumentType.specimen = KotkaDocumentType.specimen;
  index = signal<IndexType | undefined>('unit');

  indexOptions: (IndexType | undefined)[] = [undefined, 'unit', 'identification', 'typeSpecimen', 'sample'];

  vm$: Observable<ViewModel>;

  showLabelDesigner = signal(false);
  labelDesignerData$?: Observable<Document[]>;

  private searchParams?: IteratorSearchParams;

  constructor() {
    effect(() => {
      if (this.showLabelDesigner()) {
        const searchParams = this.searchParams;
        this.labelDesignerData$ = this.apiClient
          .getAllDocuments(
            this.dataType,
            searchParams?.searchQuery,
            1000,
            searchParams?.sort,
            undefined
          );
      } else {
        this.labelDesignerData$ = undefined;
      }
    });

    this.vm$ = toObservable(this.index).pipe(
      switchMap((index) => {
        if (!index) {
          const columns: DatatableColumn[] = [
            {
              headerName: 'URI',
              field: 'id',
              cellRenderer: URICellRendererComponent,
              cellRendererParams: {
                editRouterLink: ['..', 'edit'],
                showViewLink: true,
              },
              width: 145,
              flex: 0,
              lockPosition: 'left',
              defaultSelected: true,
            },
          ];
          return of({ index, columns, columnsLoading: false });
        }

        return this.apiClient.getSearchFields(this.dataType, index).pipe(
          map((fields) => {
            const columns: DatatableColumn[] = fields.map((field) => ({
              headerName: field.field[0].toUpperCase() + field.field.slice(1),
              field: field.field,
              defaultSelected: true,
            }));
            return {
              index,
              columns,
              columnsLoading: false,
            };
          }),
          startWith({
            index,
            columns: [],
            columnsLoading: true,
          })
        );
      })
    );
  }

  onDataLoad(data: DatatableLoadedData) {
    const searchParams: IteratorSearchParams = {
      sort: data.searchParams.sort,
      searchQuery: data.searchParams.searchQuery
    };

    this.searchParams = searchParams;

    this.searchResultIteratorService.setSearchParams(
      this.dataType,
      searchParams,
      true,
    );
  }
}
