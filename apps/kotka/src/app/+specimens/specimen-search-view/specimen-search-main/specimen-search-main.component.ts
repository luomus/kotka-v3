import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input, model,
  OnDestroy, output,
  Signal,
  signal,
} from '@angular/core';
import {
  ColumnSettings,
  DatatableLoadedData, DatatableSort,
  DocumentDatatableComponent,
} from '@kotka/ui/datatable';
import {
  KotkaDocumentType,
  IndexType,
  FieldAggregate,
  ElasticsearchQuery,
} from '@kotka/shared/models';
import { FormsModule } from '@angular/forms';
import {
  AggregateBy,
} from '@kotka/ui/core';
import {
  FieldData,
  SpecimenSearchFilters,
} from '../models/models';
import { SpecimenIdSearchValue, SpecimenSearchQuery, SpecimenSearchComponent
} from '@kotka/ui/search';
import { NgbAlert, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SpecimenSearchFiltersComponent } from '../specimen-search-filters/specimen-search-filters.component';
import { getSpecimenSearchQuery } from '../service/specimen-search-query-utils';

export const INDEX_OPTIONS: IndexType[] = [
  'unit',
  'identification',
  'typeSpecimen',
  'sample',
];

@Component({
  selector: 'kotka-specimen-search-main',
  templateUrl: './specimen-search-main.component.html',
  styleUrls: ['./specimen-search-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    DocumentDatatableComponent,
    SpecimenSearchComponent,
    NgbAlert,
    SpecimenSearchFiltersComponent,
  ],
})
export class SpecimenSearchMainComponent implements OnDestroy {
  dataType: KotkaDocumentType.specimen = KotkaDocumentType.specimen;

  index = model.required<IndexType>();
  aggregateFields = model.required<string[]>();
  aggregateSize = model.required<number>();
  filters = model.required<SpecimenSearchFilters>();
  idSearchValue = model.required<SpecimenIdSearchValue>();
  textSearchQuery = model.required<string>();
  columnSettings = model.required<ColumnSettings | undefined>();
  sortModel = model.required<DatatableSort>();

  fieldData = input.required<FieldData>();
  defaultAggregateFields = input.required<string[]>();
  defaultAggregateSize = input.required<number>();
  minAggregateSize = input.required<number>();
  maxAggregateSize = input.required<number>();
  extraSortModel = input.required<DatatableSort>();

  loadData =
    output<DatatableLoadedData<KotkaDocumentType.specimen, IndexType>>();

  searchQuery: Signal<string | ElasticsearchQuery>;
  aggregateBy: Signal<AggregateBy[]>;
  aggregateResults = signal<FieldAggregate[] | undefined>(undefined);
  searchError = signal<string | undefined>(undefined);

  private modalRef?: NgbModalRef;

  constructor() {
    this.searchQuery = computed(() =>
      getSpecimenSearchQuery(
        this.filters(),
        this.idSearchValue(),
        this.textSearchQuery(),
      ),
    );

    this.aggregateBy = computed(() =>
      this.aggregateFields().map((field) => ({
        field,
        aggregateField: this.fieldData().fieldMap?.[field]?.hasRaw
          ? `${field}.raw`
          : field,
        aggregateSize: this.aggregateSize(),
      })),
    );
  }

  ngOnDestroy() {
    this.modalRef?.close();
  }

  onSearch(searchQuery: SpecimenSearchQuery) {
    this.idSearchValue.set(searchQuery.idSearchValue);
    this.textSearchQuery.set(searchQuery.textSearchQuery);
  }

  onClear(searchQuery: SpecimenSearchQuery) {
    this.filters.set({ fieldValues: [] });
    this.onSearch(searchQuery);
  }

  onInvalidQueryError() {
    this.searchError.set('Invalid query!');
  }

  onDataLoad(data: DatatableLoadedData<KotkaDocumentType.specimen, IndexType>) {
    this.searchError.set(undefined);
    this.aggregateResults.set(data.result.aggregates);
    this.loadData.emit(data);
  }
}
