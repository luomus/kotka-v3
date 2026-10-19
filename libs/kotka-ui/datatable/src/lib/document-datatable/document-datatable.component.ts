import { Component, inject, output, input, effect, Signal, computed, signal, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DatatableSource,
  GetRowsParams,
  DatatableColumn,
  DatatableFilter,
  DatatableSort,
  ColumnSettings
} from '../models/models';
import { DatatableComponent } from '../datatable/datatable.component';
import { DatatableRow, DocumentDatatableDataService } from '../services/document-datatable-data.service';
import {
  IndexType,
  KotkaDocumentType,
} from '@kotka/shared/models';
import {
  AggregateBy,
  DataTypeNamePipePipe,
  SearchParams,
  UserService,
} from '@kotka/ui/core';
import { catchError, map, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';


export interface DatatableLoadedData<
  T extends KotkaDocumentType = KotkaDocumentType,
  S extends IndexType | undefined = IndexType | undefined,
> {
  searchParams: SearchParams;
  result: DatatableRow<T, S>;
}

@Component({
  selector: 'kui-document-datatable',
  templateUrl: './document-datatable.component.html',
  styleUrls: ['./document-datatable.component.scss'],
  imports: [CommonModule, DatatableComponent, DataTypeNamePipePipe],
})
export class DocumentDatatableComponent<
  T extends KotkaDocumentType = KotkaDocumentType,
  S extends T extends KotkaDocumentType.specimen ? IndexType : never = never
> {
  private dataService = inject(DocumentDatatableDataService);
  private userService = inject(UserService);

  dataType = input.required<T>();
  index = input<S>();

  columns = input<DatatableColumn[]>([]);
  columnsLoading = input<boolean>(false);
  columnSettings = model<ColumnSettings | undefined>(undefined);
  sortModel = model<DatatableSort>([]);

  enableFileExport = input<boolean>();
  enableColumnSelection = input<boolean>();
  disableFilter = input<boolean>();

  defaultFilterModel = input<DatatableFilter>({});

  searchQuery = input<string>();
  aggregateBy = input<S extends IndexType ? AggregateBy[] : never>();

  datasource = signal<DatatableSource | undefined>(undefined);
  settingsKey: Signal<string | undefined>;

  loadData = output<DatatableLoadedData<T, S>>();
  invalidQueryError = output<any>();

  private userId: Signal<string | undefined>;

  constructor() {
    this.userId = toSignal(
      this.userService.getCurrentLoggedInUser().pipe(map((user) => user.id)),
    );

    this.settingsKey = computed(
      () =>
        `${this.dataType()}${this.index() ? '-' + this.index() : ''}-table-${this.userId()}`,
    );

    effect(() => {
      this.datasource.set(
        this.getDataSource(
          this.dataType(),
          this.index(),
          this.columns(),
          this.searchQuery(),
          this.aggregateBy(),
        )
      );
    });
  }

  private getDataSource(dataType: T, index: S | undefined, columns: DatatableColumn[], searchQuery?: string, aggregateBy?: AggregateBy[]): DatatableSource {
    return {
      getRows: (params: GetRowsParams) => {
        const searchParams = this.dataService.getSearchParams(
          columns,
          params.startRow,
          params.endRow,
          params.sortModel,
          params.filterModel,
          searchQuery,
        );

        return this.dataService
          .getRows<T, S>(dataType, index, searchParams, aggregateBy).pipe(
            catchError((err) => {
              if (err.status === 400) {
                this.invalidQueryError.emit(err);
                return of(undefined);
              }
              throw err;
            }),
          )
          .subscribe((result) => {
            params.successCallback(result?.member || [], result?.totalItems || 0);
            if (result) {
              this.loadData.emit({ searchParams, result });
            }
          });
      },
    };
  }
}
