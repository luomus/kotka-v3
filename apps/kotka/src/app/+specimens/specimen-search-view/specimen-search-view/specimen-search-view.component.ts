import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  model,
  Signal,
  signal, untracked
} from '@angular/core';
import {
  ColDefWithExtra,
  ColumnSettings,
  DatatableColumn,
  DatatableLoadedData,
  DatatableSort,
  getUriColumnOptions,
  MapCellRendererComponent,
} from '@kotka/ui/datatable';
import {
  Document, FieldAggregate,
  IndexType,
  KotkaDocumentType,
  SearchField,
  SearchResultKey
} from '@kotka/shared/models';
import { MainContentComponent, MainContentHeaderDirective, SpinnerComponent } from '@kotka/ui/components';
import { FormsModule } from '@angular/forms';
import { ApiClient, IteratorSearchParams, SearchResultIteratorService } from '@kotka/ui/core';
import { SpecimenLabelDesignerComponent } from '../../specimen-label-designer/specimen-label-designer.component';
import {
  FieldData,
  SpecimenSearchFilters,
} from '../models/models';
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
import { getColId } from '@kotka/ui/datatable';

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
  },
  wgs84Location: {
    cellRenderer: MapCellRendererComponent,
    width: 170,
    flex: 0
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
  filters = signal<SpecimenSearchFilters>({ fieldValues: [] });
  idSearchValue = signal<IdSearchValue>({ text: '', query: parseIdQuery('') });
  textSearchQuery = signal('');
  columnSettings = model<ColumnSettings | undefined>(undefined);
  sortModel = model<DatatableSort>([]);

  defaultAggregateFields = DEFAULT_AGGREGATE_FIELDS;
  defaultAggregateSize = DEFAULT_AGGREGATE_SIZE;
  minAggregateSize = 1;
  maxAggregateSize = 100;

  searchLink: Signal<string>;

  fieldData: Signal<FieldData>;
  labelDesignerData$?: Observable<Document[]>;

  private activeSearchParams?: IteratorSearchParams;

  constructor() {
    this.fieldData = toSignal(
      toObservable(this.index).pipe(
        switchMap((index) => this.getFieldData(index)),
      ),
      { initialValue: INITIAL_FIELD_DATA },
    );

    this.searchLink = computed(() =>
      this.specimenLinkService.getSearchLink(
        this.index(),
        this.aggregateFields(),
        this.aggregateSize(),
        this.filters(),
        this.idSearchValue(),
        this.textSearchQuery(),
        this.columnSettings()?.selected || [],
        this.sortModel(),
      ),
    );

    effect(() => {
      this.onFieldDataChange(
        this.fieldData(),
        untracked(this.aggregateFields),
        untracked(this.filters),
        untracked(this.columnSettings),
        untracked(this.sortModel),
      );
    });

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

    this.applyQueryParamsToState(this.route.snapshot.queryParams);
  }

  onDataLoad(data: DatatableLoadedData<KotkaDocumentType.specimen, IndexType>) {
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

    this.onAggregatesChange(data.result.aggregates);
  }

  onIndexChange() {
    this.columnSettings.set(undefined);
  }

  private getFieldData(index: IndexType): Observable<FieldData> {
    const defaultSelectedFields: string[] = DEFAULT_SELECTED_FIELDS[index];
    const specialColumns: Record<string, DatatableColumn> = SPECIAL_COLUMNS;

    return this.apiClient
      .getSearchFields(KotkaDocumentType.specimen, index)
      .pipe(
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

    const parsedParams =
      this.specimenLinkService.parseSearchLinkParams(queryParams);

    if (parsedParams.index) {
      this.index.set(parsedParams.index);
    }
    if (parsedParams.aggregateFields) {
      this.aggregateFields.set(parsedParams.aggregateFields);
    }
    if (
      parsedParams.aggregateSize !== undefined &&
      parsedParams.aggregateSize >= this.minAggregateSize &&
      parsedParams.aggregateSize <= this.maxAggregateSize
    ) {
      this.aggregateSize.set(parsedParams.aggregateSize);
    }
    if (parsedParams.filters) {
      this.filters.set(parsedParams.filters);
    }
    if (parsedParams.idSearchValue) {
      this.idSearchValue.set(parsedParams.idSearchValue);
    }
    if (parsedParams.textSearchQuery) {
      this.textSearchQuery.set(parsedParams.textSearchQuery);
    }
    if (parsedParams.selectedColumns) {
      this.columnSettings.set({
        selected: parsedParams.selectedColumns,
        order: parsedParams.selectedColumns,
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

  private onFieldDataChange(
    fieldData: FieldData,
    aggregateFields: string[],
    filters: SpecimenSearchFilters,
    columnSettings: ColumnSettings | undefined,
    sortModel: DatatableSort
  ) {
    if (fieldData.fieldsLoading) {
      return;
    }

    const colIds = fieldData.columns?.map((col) => getColId(col)) || [];

    const newAggregateFields = aggregateFields.filter((field) =>
      fieldData.allAggregateFields?.includes(field),
    );
    if (newAggregateFields.length !== aggregateFields.length) {
      this.aggregateFields.set(newAggregateFields);
    }

    const fieldValues = filters.fieldValues.filter(
      (filter) => fieldData.fieldMap?.[filter.field],
    );
    if (fieldValues.length !== filters.fieldValues.length) {
      this.filters.update((filters) => ({
        ...filters,
        fieldValues,
      }));
    }

    let selected: string[] = [];
    if (columnSettings) {
      selected = columnSettings.selected.filter((field) =>
        colIds.includes(field),
      );
      const order = columnSettings.order.filter((field) =>
        colIds.includes(field),
      );
      if (
        selected.length !== columnSettings.selected.length ||
        order.length !== columnSettings.order.length
      ) {
        this.columnSettings.set({
          selected,
          order,
        });
      }
    }

    const newSortModel = sortModel.filter((sort) =>
      selected.includes(sort.colId),
    );
    if (newSortModel.length !== sortModel.length) {
      this.sortModel.set(newSortModel);
    }
  }

  private onAggregatesChange(aggregates: FieldAggregate[]) {
    const aggregateMap = aggregates.reduce(
      (map, aggregate) => {
        map[aggregate.field] = aggregate;
        return map;
      },
      <Record<string, FieldAggregate>>{},
    );

    const fieldValues = this.filters().fieldValues.filter((filter) =>
      aggregateMap[filter.field]?.values.some(
        (value) => value.value === filter.value,
      ),
    );
    if (fieldValues.length !== this.filters().fieldValues.length) {
      this.filters.update((filters) => ({
        ...filters,
        fieldValues,
      }));
    }
  }
}
