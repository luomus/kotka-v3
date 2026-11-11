import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  NgZone,
  OnDestroy,
  output,
  Signal,
  signal,
  viewChild,
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
import { AggregateBy, WINDOW } from '@kotka/ui/core';
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
  private window = inject(WINDOW);

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

  sidebarHeight = signal<string | undefined>(undefined);

  private modalRef?: NgbModalRef;
  private resizeRafId?: number;

  private sidebar = viewChild.required<ElementRef<HTMLElement>>('sidebar');

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

    afterNextRender(() => this.onResize());
  }

  @HostListener('window:resize', [])
  @HostListener('window:scroll', [])
  onResize() {
    if (this.resizeRafId === undefined) {
      this.resizeRafId = requestAnimationFrame(() => {
        this.resizeRafId = undefined;
        this.updateSidebarHeight();
      });
    }
  }

  ngOnDestroy() {
    this.modalRef?.close();

    if (this.resizeRafId !== undefined) {
      cancelAnimationFrame(this.resizeRafId);
    }
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

  private updateSidebarHeight() {
    const sidebarElem = this.sidebar().nativeElement;

    const top = Math.max(sidebarElem.getBoundingClientRect().top, 0);
    const bottom = parseFloat(getComputedStyle(sidebarElem).top) || 0;
    const height = `${this.window.innerHeight - top - bottom}px`;

    this.sidebarHeight.set(height);
  }
}
