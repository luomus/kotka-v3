import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  model,
  Signal,
  signal
} from '@angular/core';
import {
  ColDefWithExtra,
  ColumnSettings,
  DatatableColumn,
  DatatableLoadedData,
  DatatableSort,
  getUriColumnOptions
} from '@kotka/ui/datatable';
import {
  Document,
  IndexType,
  KotkaDocumentType,
  SearchField,
  SearchResultKey
} from '@kotka/shared/models';
import { MainContentComponent, MainContentHeaderDirective, SpinnerComponent } from '@kotka/ui/components';
import { FormsModule } from '@angular/forms';
import { ApiClient, IteratorSearchParams, SearchResultIteratorService } from '@kotka/ui/core';
import { SpecimenLabelDesignerComponent } from '../../specimen-label-designer/specimen-label-designer.component';
import { FieldValue } from '../specimen-search-filters/aggregations.component';
import { SpecimenLinkService } from '../service/specimen-link.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { map, startWith, switchMap } from 'rxjs/operators';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { isEqual } from 'lodash';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SpecimenSearchMainComponent } from '../specimen-search-main/specimen-search-main.component';
import { SpecimenSearchHeaderComponent } from '../specimen-search-header/specimen-search-header.component';
import { IdSearchValue, parseIdQuery } from '@kotka/ui/search';

export interface FieldData {
  fields?: SearchField[];
  fieldMap?: Record<string, SearchField>;
  columns?: DatatableColumn[];
  allAggregateFields?: string[];
  allAggregateColumns?: DatatableColumn[];
  fieldsLoading: boolean;
}

const INITIAL_FIELD_DATA: FieldData = {
  fieldsLoading: true,
};

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

const SPECIAL_COLUMNS: Partial<Record<SearchResultKey, DatatableColumn>> = {
  documentURI: {
    ...getUriColumnOptions({
      editRouterLink: ['..', 'edit'],
      showViewLink: true,
    }),
    lockPosition: 'left'
  }
};

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
  private apiClient = inject(ApiClient);
  private searchResultIteratorService = inject(SearchResultIteratorService);
  private specimenLinkService = inject(SpecimenLinkService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  showLabelDesigner = signal(false);

  index = signal<IndexType>('unit');
  aggregateFields = signal<string[]>(DEFAULT_AGGREGATE_FIELDS, {
    equal: isEqual,
  });
  aggregateSize = signal<number>(DEFAULT_AGGREGATE_SIZE);
  filtersValue = signal<FieldValue[]>([]);
  idSearchValue = signal<IdSearchValue>({ text: '', query: parseIdQuery('') });
  textSearchQuery = signal('');
  columnSettings = model<ColumnSettings | undefined>(undefined);
  sortModel = model<DatatableSort>([]);

  defaultAggregateFields = DEFAULT_AGGREGATE_FIELDS;
  defaultAggregateSize = DEFAULT_AGGREGATE_SIZE;

  searchLink: Signal<string>;

  fieldData: Signal<FieldData>;
  labelDesignerData$?: Observable<Document[]>;

  private activeSearchParams?: IteratorSearchParams;

  constructor() {
    this.searchLink = computed(() =>
      this.specimenLinkService.getSearchLink(
        this.index(),
        this.aggregateFields(),
        this.aggregateSize(),
        this.filtersValue(),
        this.idSearchValue(),
        this.textSearchQuery(),
        this.columnSettings()?.selected || [],
        this.sortModel(),
      ),
    );

    effect(() => {
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
    });

    this.fieldData = toSignal(
      toObservable(this.index).pipe(
        switchMap((index) => this.getFieldData(index)),
      ),
      { initialValue: INITIAL_FIELD_DATA },
    );

    this.applyQueryParamsToState(this.route.snapshot.queryParams);
  }

  onDataLoad(data: DatatableLoadedData) {
    const searchParams: IteratorSearchParams = {
      sort: data.searchParams.sort,
      searchQuery: data.searchParams.searchQuery,
    };

    this.activeSearchParams = searchParams;

    this.searchResultIteratorService.setSearchParams(
      KotkaDocumentType.specimen,
      searchParams,
      true,
    );
  }

  onIndexChange() {
    this.columnSettings.set(undefined);
  }

  private getFieldData(index: IndexType): Observable<FieldData> {
    const defaultSelectedFields: string[] = DEFAULT_SELECTED_FIELDS[index];
    const specialColumns: Record<string, DatatableColumn> = SPECIAL_COLUMNS;

    return this.apiClient.getSearchFields(KotkaDocumentType.specimen, index).pipe(
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

  private applyQueryParamsToState(queryParams: Params) {
    if (Object.keys(queryParams).length === 0) {
      return;
    }

    const parsedParams = this.specimenLinkService.parseSearchLinkParams(queryParams);

    if (parsedParams.index) {
      this.index.set(parsedParams.index);
    }
    if (parsedParams.aggregateFields) {
      this.aggregateFields.set(parsedParams.aggregateFields);
    }
    if (parsedParams.aggregateSize) {
      this.aggregateSize.set(parsedParams.aggregateSize);
    }
    if (parsedParams.filtersValue) {
      this.filtersValue.set(parsedParams.filtersValue);
    }
    if (parsedParams.idSearchValue) {
      this.idSearchValue.set(parsedParams.idSearchValue);
    }
    if (parsedParams.textSearchQuery) {
      this.textSearchQuery.set(parsedParams.textSearchQuery);
    }
    if (parsedParams.selectedFields) {
      this.columnSettings.set({
        selected: parsedParams.selectedFields,
        order: []
      });
    }
    if (parsedParams.sort) {
      this.sortModel.set(parsedParams.sort);
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
  }
}
