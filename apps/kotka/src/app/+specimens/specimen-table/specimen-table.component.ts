import {
  ChangeDetectionStrategy,
  Component, computed,
  effect,
  inject, Signal,
  signal,
} from '@angular/core';
import {
  DatatableColumn,
  DatatableLoadedData,
  DocumentDatatableComponent, getUriColumnOptions,
} from '@kotka/ui/datatable';
import {
  KotkaDocumentType, Document, IndexType, SearchResponse, FieldAggregate, SearchField,
  SearchResultKey
} from '@kotka/shared/models';
import { MainContentComponent, SpinnerComponent } from '@kotka/ui/components';
import { FormsModule } from '@angular/forms';
import {
  ApiClient, DataTypeNamePipePipe,
  IteratorSearchParams,
  SearchResultIteratorService,
} from '@kotka/ui/core';
import { SpecimenLabelDesignerComponent } from '../specimen-label-designer/specimen-label-designer.component';
import { AggregationsComponent, FieldValue } from './aggregations.component';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { map, startWith, switchMap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { BuilderQuery, builderQueryToQueryString, groupToQueryString, joinQueryStrings,
  SearchGroup, SearchQuery, SpecimenSearchComponent
} from '@kotka/ui/search';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';

interface ViewModel {
  index: IndexType | undefined;
  fields: SearchField[];
  columns: DatatableColumn[];
  columnsLoading: boolean;
}

const DEFAULT_SELECTED_FIELDS: Record<IndexType, SearchResultKey[]> = {
  unit: ['documentID', 'locality', 'taxon'],
  identification: ['documentID', 'locality', 'taxon'],
  typeSpecimen: ['documentID', 'locality', 'taxon'],
  sample: ['documentID', 'id', 'recordParts', 'taxon'],
};
const SPECIAL_COLUMNS: Partial<Record<SearchResultKey, DatatableColumn>> = {
  documentID: {
    ...getUriColumnOptions({
      editRouterLink: ['..', 'edit'],
      showViewLink: true,
    }),
    lockPosition: 'left'
  },
  id: getUriColumnOptions({
    showEditLink: false,
  })
};

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
    SpecimenSearchComponent,
    NgbAlert,
    DataTypeNamePipePipe,
  ],
})
export class SpecimenTableComponent {
  private apiClient = inject(ApiClient);
  private searchResultIteratorService = inject(SearchResultIteratorService);

  dataType: KotkaDocumentType.specimen = KotkaDocumentType.specimen;
  index = signal<IndexType>('unit');
  searchQuery: Signal<string>;

  searchError?: string;

  indexOptions: IndexType[] = ['unit', 'identification', 'typeSpecimen', 'sample'];
  aggregateFields: string[] = ['editor', 'leg', 'taxon', 'taxonRank', 'typeStatus'];

  aggregates?: FieldAggregate[];

  vm$: Observable<ViewModel>;

  showLabelDesigner = signal(false);
  labelDesignerData$?: Observable<Document[]>;

  private filtersSearchQuery = signal('');
  private idSearchQuery = signal<BuilderQuery>({ groups: [], joinOperator: 'AND' });
  private inputSearchQuery = signal('');
  private activeSearchParams?: IteratorSearchParams;

  constructor() {
    this.searchQuery = computed(() => (
      joinQueryStrings(
        'AND',
        this.filtersSearchQuery(),
        builderQueryToQueryString(this.idSearchQuery()),
        this.inputSearchQuery()
      )
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
        const defaultSelectedFields: string[] = DEFAULT_SELECTED_FIELDS[index];
        const specialColumns: Record<string, DatatableColumn> = SPECIAL_COLUMNS;

        return this.apiClient.getSearchFields(this.dataType, index).pipe(
          map((fields) => {
            const columns: DatatableColumn[] = fields.map((field) => ({
              headerName: field.label || field.field,
              field: field.field,
              ...(specialColumns[field.field] || {}),
              defaultSelected: defaultSelectedFields.includes(field.field),
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

  onSearch(searchQuery: SearchQuery) {
    this.idSearchQuery.set(searchQuery.idSearchQuery);
    this.inputSearchQuery.set(searchQuery.textSearchQuery);
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
