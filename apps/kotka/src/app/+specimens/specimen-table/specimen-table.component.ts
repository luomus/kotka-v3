import {
  ChangeDetectionStrategy,
  Component, computed,
  effect,
  inject, Signal,
  signal,
} from '@angular/core';
import {
  URICellRendererComponent,
  DatatableColumn,
  DatatableLoadedData,
  DocumentDatatableComponent,
} from '@kotka/ui/datatable';
import { KotkaDocumentType, Document, IndexType, SearchResponse, FieldAggregate, SearchField } from '@kotka/shared/models';
import { MainContentComponent, SpinnerComponent } from '@kotka/ui/components';
import { FormsModule } from '@angular/forms';
import {
  ApiClient,
  IteratorSearchParams,
  SearchResultIteratorService,
} from '@kotka/ui/core';
import { SpecimenLabelDesignerComponent } from '../specimen-label-designer/specimen-label-designer.component';
import { AggregationsComponent, FieldValue } from './aggregations.component';
import { Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { map, startWith, switchMap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { groupToQueryString, joinQueryStrings, SearchComponent, SearchGroup } from '@kotka/ui/search';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';

interface ViewModel {
  index: IndexType | undefined;
  fields: SearchField[];
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
    AggregationsComponent,
    SearchComponent,
    NgbAlert,
  ],
})
export class SpecimenTableComponent {
  private apiClient = inject(ApiClient);
  private searchResultIteratorService = inject(SearchResultIteratorService);

  dataType: KotkaDocumentType.specimen = KotkaDocumentType.specimen;
  index = signal<IndexType | undefined>('unit');
  searchQuery: Signal<string>;

  searchError?: string;

  indexOptions: (IndexType | undefined)[] = [undefined, 'unit', 'identification', 'typeSpecimen', 'sample'];
  aggregateFields: string[] = ['editor', 'leg', 'taxon', 'taxonRank', 'typeStatus'];

  aggregates?: FieldAggregate[];

  vm$: Observable<ViewModel>;

  showLabelDesigner = signal(false);
  labelDesignerData$?: Observable<Document[]>;

  private filtersSearchQuery = signal('');
  private inputSearchQuery = signal('');
  private activeSearchParams?: IteratorSearchParams;

  constructor() {
    this.searchQuery = computed(() => (
      joinQueryStrings(this.filtersSearchQuery(), this.inputSearchQuery())
    ));

    effect(() => {
      if (this.showLabelDesigner()) {
        const searchParams = this.activeSearchParams;
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
          return of({ index, fields: [{ type: 'keyword', field: 'id' }], columns, columnsLoading: false });
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
              fields,
              columns,
              columnsLoading: false,
            };
          }),
          startWith({
            index,
            fields: [],
            columns: [],
            columnsLoading: true,
          })
        );
      })
    );
  }

  onAggregationFiltersChange(fieldValues: FieldValue[] = []) {
    const searchGroup: SearchGroup = {
      criteria: fieldValues.map(fieldValue => ({
        field: fieldValue.field,
        operator: 'equals',
        value: `${fieldValue.value}`
      })),
      joinOperator: 'AND'
    };

    this.filtersSearchQuery.set(groupToQueryString(searchGroup).result);
  }

  onSearch(searchQuery: string) {
    this.inputSearchQuery.set(searchQuery);
  }

  onDataLoad(data: DatatableLoadedData) {
    this.aggregates = (<SearchResponse>data.result).aggregates;

    const searchParams: IteratorSearchParams = {
      sort: data.searchParams.sort,
      searchQuery: data.searchParams.searchQuery
    };

    this.activeSearchParams = searchParams;

    this.searchResultIteratorService.setSearchParams(
      this.dataType,
      searchParams,
      true,
    );

    this.searchError = undefined;
  }

  onInvalidQueryError() {
    this.searchError = 'Invalid query!';
  }
}
