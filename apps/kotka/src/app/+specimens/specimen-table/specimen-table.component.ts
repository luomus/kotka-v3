import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject, model,
  OnDestroy,
  Signal,
  signal,
} from '@angular/core';
import {
  ColDefWithExtra, ColumnSettings,
  DatatableColumn,
  DatatableLoadedData, DatatableSort,
  DocumentDatatableComponent,
  getUriColumnOptions,
} from '@kotka/ui/datatable';
import {
  KotkaDocumentType, Document, IndexType, SearchResponse, FieldAggregate, SearchField,
  SearchResultKey
} from '@kotka/shared/models';
import { MainContentComponent, MainContentHeaderDirective, SpinnerComponent } from '@kotka/ui/components';
import { FormsModule } from '@angular/forms';
import {
  AggregateBy,
  ApiClient, DataTypeNamePipePipe,
  IteratorSearchParams, Logger, SearchResultIteratorService, ToastService, WINDOW
} from '@kotka/ui/core';
import { SpecimenLabelDesignerComponent } from '../specimen-label-designer/specimen-label-designer.component';
import { AggregationsComponent, FieldValue } from './aggregations.component';
import {
  AggregationsSettings,
  AggregationsSettingsModalComponent,
} from './aggregations-settings-modal.component';
import { SpecimenLinkService } from './specimen-link.service';
import { from, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { map, startWith, switchMap } from 'rxjs/operators';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BuilderQuery, builderQueryToQueryString, joinQueryStrings, parseIdQuery, SearchQuery, SpecimenSearchComponent
} from '@kotka/ui/search';
import { NgbAlert, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { isEqual } from 'lodash';
import { ActivatedRoute, Params, Router } from '@angular/router';

interface FieldData {
  fields: SearchField[];
  fieldMap: Record<string, SearchField>;
  columns: DatatableColumn[];
  allAggregateFields: string[];
  allAggregateColumns: DatatableColumn[];
  fieldsLoading: boolean;
}

export const INDEX_OPTIONS: IndexType[] = [
  'unit',
  'identification',
  'typeSpecimen',
  'sample',
];

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
const DEFAULT_AGGREGATE_SIZE = 10;

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
    MainContentHeaderDirective,
  ],
})
export class SpecimenTableComponent implements OnDestroy {
  private apiClient = inject(ApiClient);
  private searchResultIteratorService = inject(SearchResultIteratorService);
  private modalService = inject(NgbModal);
  private specimenLinkService = inject(SpecimenLinkService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private window = inject(WINDOW);
  private toastService = inject(ToastService);
  private logger = inject(Logger);

  dataType: KotkaDocumentType.specimen = KotkaDocumentType.specimen;
  index = signal<IndexType>('unit');
  searchQuery: Signal<string>;
  searchLink: Signal<string>;

  searchError?: string;

  indexOptions = INDEX_OPTIONS;

  aggregateValidFields = computed(() =>
    this.aggregateFields().filter(
      (field) => this.fieldData().fieldMap[field] !== undefined,
    ),
  );
  aggregateBy: Signal<AggregateBy[]> = computed(() =>
    this.aggregateValidFields().map((field) => ({
      field,
      aggregateField: this.fieldData().fieldMap[field]?.hasRaw
        ? `${field}.raw`
        : field,
      aggregateSize: this.aggregateSize(),
    })),
  );
  aggregateSize = signal<number>(DEFAULT_AGGREGATE_SIZE);
  aggregateFieldOrder = signal<string[] | undefined>(undefined);

  aggregateResults?: FieldAggregate[];

  idSearchText = signal<string>('');
  idSearchTextParseError = signal<string>('');

  fieldData: Signal<FieldData>;
  columnSettings = model<ColumnSettings | undefined>(undefined);
  sortModel = model<DatatableSort>([]);

  showLabelDesigner = signal(false);
  labelDesignerData$?: Observable<Document[]>;

  private aggregateFields = signal<string[]>(DEFAULT_AGGREGATE_FIELDS, {
    equal: isEqual,
  });

  filtersValue = signal<FieldValue[]>([]);
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
        this.filtersValueToSearchQuery(this.filtersValue()),
        builderQueryToQueryString(this.idSearchQuery()),
        this.inputSearchQuery(),
      ),
    );

    this.searchLink = computed(() =>
      this.specimenLinkService.getSearchLink(
        this.index(),
        this.aggregateValidFields(),
        this.aggregateSize(),
        this.filtersValue(),
        this.idSearchText(),
        this.inputSearchQuery(),
        this.columnSettings()?.selected || [],
        this.sortModel(),
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

    this.applyQueryParamsToState(this.route.snapshot.queryParams);
  }

  ngOnDestroy() {
    this.modalRef?.close();
  }

  onSearch(searchQuery: SearchQuery) {
    this.idSearchTextParseError.set('');

    let idSearchQuery: BuilderQuery;
    try {
      idSearchQuery = parseIdQuery(searchQuery.idSearchText);
    } catch (e: any) {
      this.idSearchTextParseError.set(e?.message || 'Failed to parse ID query');
      return;
    }

    this.idSearchText.set(searchQuery.idSearchText);
    this.idSearchQuery.set(idSearchQuery);
    this.inputSearchQuery.set(searchQuery.textSearchQuery);
  }

  openAggregateSettingsModal() {
    this.modalRef = this.modalService.open(AggregationsSettingsModalComponent, {
      backdrop: 'static',
      size: 'md',
      modalDialogClass: 'scrollable-modal column-settings-modal',
    });

    this.modalRef.componentInstance.columns.set(
      this.fieldData().allAggregateColumns,
    );
    this.modalRef.componentInstance.columnSettings.set({
      selected: this.aggregateValidFields(),
      order: this.aggregateFieldOrder() || this.fieldData().allAggregateFields,
    });
    this.modalRef.componentInstance.defaultColumnSettings.set({
      selected: DEFAULT_AGGREGATE_FIELDS,
      order: this.fieldData().allAggregateFields,
    });
    this.modalRef.componentInstance.filterSize.set(this.aggregateSize());
    this.modalRef.componentInstance.defaultFilterSize.set(
      DEFAULT_AGGREGATE_SIZE,
    );

    from(this.modalRef.result).subscribe({
      next: (settings: AggregationsSettings) => {
        this.aggregateFields.set(settings.selected);
        this.aggregateFieldOrder.set(settings.order);
        this.aggregateSize.set(settings.filterSize);
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

  copySearchLinkToClipboard() {
    const searchLink = this.searchLink();
    this.window.navigator.clipboard.writeText(searchLink).then(
      () => {
        this.toastService.showSuccess('Search link copied to clipboard');
      },
      (err) => {
        this.logger.error('Failed to copy search link to clipboard', err);
        this.toastService.showError('Failed to copy search link to clipboard');
      },
    );
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

  private filtersValueToSearchQuery(fieldValues: FieldValue[]): string {
    return builderQueryToQueryString({
      groups: [
        {
          criteria: fieldValues.map((fieldValue) => ({
            field: fieldValue.field,
            operator: 'equals',
            value: `${fieldValue.value}`,
          })),
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
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
    if (parsedParams.aggregateValues) {
      this.filtersValue.set(parsedParams.aggregateValues);
    }
    if (parsedParams.idSearchText) {
      this.idSearchText.set(parsedParams.idSearchText);
    }
    if (parsedParams.inputSearchQuery) {
      this.inputSearchQuery.set(parsedParams.inputSearchQuery);
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
