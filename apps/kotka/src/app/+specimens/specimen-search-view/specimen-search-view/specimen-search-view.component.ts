import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  model,
  Signal,
  signal,
} from '@angular/core';
import {
  ColumnSettings,
  DatatableLoadedData,
  DatatableSort,
} from '@kotka/ui/datatable';
import {
  Document,
  IndexType,
  KotkaDocumentType,
  SearchResult,
  SearchResultKey,
} from '@kotka/shared/models';
import {
  MainContentComponent,
  MainContentHeaderDirective,
  SpinnerComponent,
} from '@kotka/ui/components';
import { FormsModule } from '@angular/forms';
import {
  DocumentSortData,
  IteratorSearchParams,
  SearchResultIteratorService,
  UserService,
} from '@kotka/ui/core';
import { SpecimenLabelDesignerComponent } from '../../specimen-label-designer/specimen-label-designer.component';
import { AggregateSettings, FieldData, SpecimenSearchFilters } from '../models/models';
import { FieldDataService } from '../service/field-data.service';
import { SpecimenLinkService } from '../service/specimen-link.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SpecimenSearchMainComponent } from '../specimen-search-main/specimen-search-main.component';
import { SpecimenSearchHeaderComponent } from '../specimen-search-header/specimen-search-header.component';
import { parseIdQuery, SpecimenIdSearchValue } from '@kotka/ui/search';
import { LocalStorageService } from 'ngx-webstorage';

interface SpecimenSearchState {
  index: IndexType;
  aggregateSettings?: AggregateSettings;
  filters: SpecimenSearchFilters;
  idSearchValue: SpecimenIdSearchValue;
  textSearchQuery: string;
  columnSettings?: ColumnSettings;
  sort: DatatableSort;
}

const DEFAULT_SELECTED_FIELDS: Record<IndexType, SearchResultKey[]> = {
  unit: ['documentURI', 'locality', 'taxon'],
  identification: ['documentURI', 'locality', 'taxon'],
  typeSpecimen: ['documentURI', 'locality', 'taxon'],
  sample: ['documentURI', 'id', 'recordParts', 'taxon'],
};

const DEFAULT_AGGREGATE_FIELDS: string[] = [
  'editor',
  'leg',
  'taxon',
  'taxonRank',
  'typeStatus',
];
const DEFAULT_AGGREGATE_SIZE = 10;

@Component({
  selector: 'kotka-search-view',
  templateUrl: './specimen-search-view.component.html',
  styleUrls: ['./specimen-search-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MainContentComponent,
    FormsModule,
    SpecimenLabelDesignerComponent,
    AsyncPipe,
    SpinnerComponent,
    MainContentHeaderDirective,
    SpecimenSearchMainComponent,
    SpecimenSearchHeaderComponent,
  ],
})
export class SpecimenSearchViewComponent {
  private fieldDataService = inject(FieldDataService);
  private searchResultIteratorService = inject(SearchResultIteratorService);
  private specimenLinkService = inject(SpecimenLinkService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(LocalStorageService);
  private userService = inject(UserService);

  showLabelDesigner = signal(false);

  index = signal<IndexType>('unit');
  aggregateSettings = model<AggregateSettings | undefined>(undefined);
  filters = signal<SpecimenSearchFilters>({ fieldValues: [] });
  idSearchValue = signal<SpecimenIdSearchValue>({
    text: '',
    query: parseIdQuery(''),
  });
  textSearchQuery = signal('');
  columnSettings = model<ColumnSettings | undefined>(undefined);
  sortModel = model<DatatableSort>([]);

  defaultAggregateFields = DEFAULT_AGGREGATE_FIELDS;
  defaultAggregateSize = DEFAULT_AGGREGATE_SIZE;
  minAggregateSize = 1;
  maxAggregateSize = 100;
  extraSortModel: DatatableSort = [
    {
      colId: 'dateCreated',
      sort: 'desc',
    },
    {
      colId: 'id',
      sort: 'desc',
    },
  ];

  searchLink: Signal<string>;

  fieldData: Signal<FieldData>;
  labelDesignerData$?: Observable<Document[]>;

  private searchStateStorageKey: Signal<string>;

  private activeSearchParams?: IteratorSearchParams;

  constructor() {
    this.fieldData = toSignal(
      toObservable(this.index).pipe(
        switchMap((index) =>
          this.fieldDataService.getFieldData(index, DEFAULT_SELECTED_FIELDS[index], this.onRowSelect.bind(this))
        ),
      ),
      { initialValue: { fieldsLoading: true } },
    );

    this.searchLink = computed(() => {
      const aggregateSettings = this.aggregateSettings();
      const columnSettings = this.columnSettings();

      if (!aggregateSettings || !columnSettings) {
        return '';
      }

      return this.specimenLinkService.getSearchLink(
        this.index(),
        aggregateSettings.selected,
        aggregateSettings.size,
        this.filters(),
        this.idSearchValue(),
        this.textSearchQuery(),
        columnSettings.selected,
        this.sortModel(),
      );
    });

    this.searchStateStorageKey = computed(
      () => `specimen-search-state-${this.userService.user()?.id}`,
    );

    /*effect(() => {
      if (this.showLabelDesigner()) {
        const searchParams = this.activeSearchParams;
        this.labelDesignerData$ = this.apiClient.getAllDocuments(
          KotkaDocumentType.specimen,
          searchParams?.searchQuery,
          1000,
          searchParams?.sort,
          undefined,
        );
      } else {
        this.labelDesignerData$ = undefined;
      }
    });*/

    effect(() => {
      const state: SpecimenSearchState = {
        index: this.index(),
        filters: this.filters(),
        idSearchValue: this.idSearchValue(),
        textSearchQuery: this.textSearchQuery(),
        sort: this.sortModel(),
      };
      this.storage.store(this.searchStateStorageKey(), state);
    });

    let firstIndexChange = true;
    effect(() => {
      this.index();
      if (firstIndexChange) {
        firstIndexChange = false;
        return;
      }
      this.onIndexChange();
    });

    this.initState();
  }

  onDataLoad(data: DatatableLoadedData<KotkaDocumentType.specimen, IndexType>) {
    const searchParams: IteratorSearchParams | undefined = data.searchParams
      .sort
      ? {
          index: this.index(),
          sort: data.searchParams.sort,
          searchQuery: data.searchParams.searchQuery,
        }
      : undefined;

    this.activeSearchParams = searchParams;

    this.searchResultIteratorService.setSearchParams(
      KotkaDocumentType.specimen,
      searchParams,
    );
  }

  onIndexChange() {
    this.aggregateSettings.set(undefined);
    this.columnSettings.set(undefined);
  }

  private initState() {
    const queryParams = this.route.snapshot.queryParams;
    const hasQueryParams = Object.keys(queryParams).length > 0;

    if (hasQueryParams) {
      this.applyQueryParamsToState(queryParams);
    } else {
      const state: SpecimenSearchState | null = this.storage.retrieve(
        this.searchStateStorageKey(),
      );
      if (state) {
        this.applyState(state);
      }
    }
  }

  private applyQueryParamsToState(queryParams: Params) {
    if (Object.keys(queryParams).length === 0) {
      return;
    }

    const parsedParams = this.specimenLinkService.parseSearchLinkParams(queryParams);
    const { aggregateFields, aggregateSize } = parsedParams;

    this.applyState({
      ...parsedParams,
      aggregateSettings:
        aggregateFields || aggregateSize !== undefined
          ? {
            selected: aggregateFields || DEFAULT_AGGREGATE_FIELDS,
            order: aggregateFields || [],
            size: aggregateSize ?? DEFAULT_AGGREGATE_SIZE,
          }
          : undefined,
      columnSettings: parsedParams.selectedColumns
        ? {
          selected: parsedParams.selectedColumns,
          order: parsedParams.selectedColumns,
        }
        : undefined,
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
  }

  private applyState(state: Partial<SpecimenSearchState>) {
    if (state.index) {
      this.index.set(state.index);
    }
    if (state.aggregateSettings) {
      this.aggregateSettings.set(state.aggregateSettings);
    }
    if (state.filters) {
      this.filters.set(state.filters);
    }
    if (state.idSearchValue) {
      this.idSearchValue.set(state.idSearchValue);
    }
    if (state.textSearchQuery !== undefined) {
      this.textSearchQuery.set(state.textSearchQuery);
    }
    if (state.columnSettings) {
      this.columnSettings.set(state.columnSettings);
    }
    if (state.sort) {
      this.sortModel.set(state.sort);
    }
  }

  private onRowSelect(result: SearchResult) {
    const sort = result._sort;
    const currentData: DocumentSortData | undefined = sort
      ? { id: result.id, documentURI: result.documentURI, sort }
      : undefined;

    this.searchResultIteratorService.setCurrentData(
      KotkaDocumentType.specimen,
      currentData,
    );
  }
}
