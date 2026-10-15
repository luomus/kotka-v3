import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  Signal,
  signal,
} from '@angular/core';
import {
  ColDefWithExtra,
  ColumnSettingsModalComponent,
  DatatableColumn,
  DatatableLoadedData,
  DocumentDatatableComponent,
  getUriColumnOptions,
} from '@kotka/ui/datatable';
import {
  KotkaDocumentType, Document, IndexType, SearchResponse, FieldAggregate, SearchField,
  SearchResultKey
} from '@kotka/shared/models';
import { MainContentComponent, SpinnerComponent } from '@kotka/ui/components';
import { FormsModule } from '@angular/forms';
import {
  AggregateBy,
  ApiClient, DataTypeNamePipePipe,
  IteratorSearchParams,
  SearchResultIteratorService
} from '@kotka/ui/core';
import { SpecimenLabelDesignerComponent } from '../specimen-label-designer/specimen-label-designer.component';
import { AggregationsComponent, FieldValue } from './aggregations.component';
import { from, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { map, startWith, switchMap } from 'rxjs/operators';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BuilderQuery, builderQueryToQueryString, groupToQueryString, joinQueryStrings,
  SearchGroup, SearchQuery, SpecimenSearchComponent
} from '@kotka/ui/search';
import { NgbAlert, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

interface FieldData {
  fields: SearchField[];
  fieldMap: Record<string, SearchField>;
  columns: DatatableColumn[];
  allAggregateFields: string[];
  allAggregateColumns: DatatableColumn[];
  fieldsLoading: boolean;
}

const DEFAULT_SELECTED_FIELDS: Record<IndexType, SearchResultKey[]> = {
  unit: ['documentID', 'locality', 'taxon'],
  identification: ['documentID', 'locality', 'taxon'],
  typeSpecimen: ['documentID', 'locality', 'taxon'],
  sample: ['documentID', 'id', 'recordParts', 'taxon'],
};

const DEFAULT_AGGREGATE_FIELDS: string[] = [
  'editor',
  'leg',
  'taxon',
  'taxonRank',
  'typeStatus',
];

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

const INITIAL_FIELD_DATA: FieldData = {
  fields: [],
  fieldMap: {},
  columns: [],
  allAggregateFields: [],
  allAggregateColumns: [],
  fieldsLoading: true,
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
export class SpecimenTableComponent implements OnDestroy {
  private apiClient = inject(ApiClient);
  private searchResultIteratorService = inject(SearchResultIteratorService);
  private modalService = inject(NgbModal);

  dataType: KotkaDocumentType.specimen = KotkaDocumentType.specimen;
  index = signal<IndexType>('unit');
  searchQuery: Signal<string>;

  searchError?: string;

  indexOptions: IndexType[] = [
    'unit',
    'identification',
    'typeSpecimen',
    'sample',
  ];

  aggregateValidFields = computed(() =>
    this.aggregateFields().filter(
      (field) => this.fieldData().fieldMap[field] !== undefined,
    ),
  );
  aggregateBy: Signal<AggregateBy[]> = computed(() =>
    this.aggregateValidFields().map((field) => ({
      field,
      aggregateField: this.fieldData().fieldMap[field]?.hasRaw ? `${field}.raw` : field,
      size: this.aggregateSize(),
    })),
  );
  aggregateSize = signal<number>(10);
  aggregateFieldOrder = signal<string[] | undefined>(undefined);

  aggregateResults?: FieldAggregate[];

  fieldData: Signal<FieldData>;

  showLabelDesigner = signal(false);
  labelDesignerData$?: Observable<Document[]>;

  private aggregateFields = signal<string[]>(DEFAULT_AGGREGATE_FIELDS);

  private filtersSearchQuery = signal('');
  private idSearchQuery = signal<BuilderQuery>({
    groups: [],
    joinOperator: 'AND',
  });
  private inputSearchQuery = signal('');

  private activeSearchParams?: IteratorSearchParams;
  private modalRef?: NgbModalRef;

  constructor() {
    this.searchQuery = computed(() =>
      joinQueryStrings(
        'AND',
        this.filtersSearchQuery(),
        builderQueryToQueryString(this.idSearchQuery()),
        this.inputSearchQuery(),
      ),
    );

    effect(() => {
      if (this.showLabelDesigner()) {
        const searchParams = this.activeSearchParams;
        this.labelDesignerData$ = this.apiClient.getAllDocuments(
          this.dataType,
          searchParams?.searchQuery,
          1000,
          searchParams?.sort,
          undefined,
        );
      } else {
        this.labelDesignerData$ = undefined;
      }
    });

    this.fieldData = toSignal(
      toObservable(this.index).pipe(
        switchMap((index) => this.getFieldData(index)),
      ),
      { initialValue: INITIAL_FIELD_DATA },
    );
  }

  ngOnDestroy() {
    this.modalRef?.close();
  }

  onAggregationFiltersChange(fieldValues: FieldValue[] = []) {
    const searchGroup: SearchGroup = {
      criteria: fieldValues.map((fieldValue) => ({
        field: fieldValue.field,
        operator: 'equals',
        value: `${fieldValue.value}`,
      })),
      joinOperator: 'AND',
    };

    this.filtersSearchQuery.set(groupToQueryString(searchGroup).result);
  }

  onSearch(searchQuery: SearchQuery) {
    this.idSearchQuery.set(searchQuery.idSearchQuery);
    this.inputSearchQuery.set(searchQuery.textSearchQuery);
  }

  openAggregateSettingsModal() {
    this.modalRef = this.modalService.open(ColumnSettingsModalComponent, {
      backdrop: 'static',
      size: 'md',
      modalDialogClass: 'scrollable-modal column-settings-modal',
    });

    this.modalRef.componentInstance.columns.set(
      this.fieldData().allAggregateColumns,
    );
    this.modalRef.componentInstance.settings.set({
      selected: this.aggregateValidFields(),
      order: this.aggregateFieldOrder() || this.fieldData().allAggregateFields,
    });
    this.modalRef.componentInstance.defaultSettings.set({
      selected: DEFAULT_AGGREGATE_FIELDS,
      order: this.fieldData().allAggregateFields,
    });
    this.modalRef.componentInstance.title.set('Select fields');
    this.modalRef.componentInstance.description.set(
      'Select fields that are displayed on the sidebar.',
    );
    this.modalRef.componentInstance.searchLabel.set('Search fields');

    from(this.modalRef.result).subscribe({
      next: (settings) => {
        this.aggregateFields.set(settings.selected);
        this.aggregateFieldOrder.set(settings.order);
      },
      error: () => undefined,
    });
  }

  onDataLoad(data: DatatableLoadedData) {
    this.aggregateResults = (<SearchResponse>data.result).aggregates;

    const searchParams: IteratorSearchParams = {
      sort: data.searchParams.sort,
      searchQuery: data.searchParams.searchQuery,
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

  private getFieldData(index: IndexType): Observable<FieldData> {
    const defaultSelectedFields: string[] = DEFAULT_SELECTED_FIELDS[index];
    const specialColumns: Record<string, DatatableColumn> = SPECIAL_COLUMNS;

    return this.apiClient.getSearchFields(this.dataType, index).pipe(
      map((fields) => {
        const fieldMap: Record<string, SearchField> = fields.reduce(
          (result, field) => {
            result[field.field] = field;
            return result;
          },
          <Record<string, SearchField>>{},
        );

        const columns: DatatableColumn[] = fields.map((field) => ({
          headerName: field.label || field.field,
          field: field.field,
          sortField: field.hasRaw ? `${field.field}.raw` : field.field,
          ...(specialColumns[field.field] || {}),
          defaultSelected: defaultSelectedFields.includes(field.field),
        }));

        const allAggregateColumns: ColDefWithExtra[] = fields
          .filter((field) => field.hasRaw || field.type === 'keyword')
          .map((field) => ({
            colId: field.field,
            headerName: field.label || field.field,
            field: field.field,
          }));

        const allAggregateFields: string[] = allAggregateColumns.map(
          (col) => col.colId,
        );

        return {
          fields,
          fieldMap,
          columns,
          allAggregateColumns,
          allAggregateFields,
          fieldsLoading: false,
        };
      }),
      startWith(INITIAL_FIELD_DATA),
    );
  }
}
