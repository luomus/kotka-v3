import { Component, ViewChild, inject, output, input, effect, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DatatableSource,
  GetRowsParams,
  DatatableColumn,
  DatatableFilter, DatatableSort
} from '../models/models';
import { DatatableComponent } from '../datatable/datatable.component';
import { DatatableRow, DocumentDatatableDataService } from '../services/document-datatable-data.service';
import {
  IndexType,
  KotkaDocumentType,
} from '@kotka/shared/models';
import { DataTypeNamePipePipe, SearchParams, UserService } from '@kotka/ui/core';
import { map } from 'rxjs';
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

  @ViewChild(DatatableComponent, { static: true })
  datatableComponent!: DatatableComponent;

  dataType = input.required<T>();
  index = input<S>();

  columns = input<DatatableColumn[]>([]);
  columnsLoading = input<boolean>(false);

  enableFileExport = input<boolean>();
  enableColumnSelection = input<boolean>();
  disableFilter = input<boolean>();

  defaultFilterModel = input<DatatableFilter>({});

  extraSortModel = input<DatatableSort>([]);
  extraSearchQuery = input<string>();
  aggregateBy = input<S extends IndexType ? string[] : never>();

  datasource: DatatableSource;
  settingsKey: Signal<string | undefined>;

  loadData = output<DatatableLoadedData<T, S>>();

  private userId: Signal<string | undefined>;

  constructor() {
    this.datasource = {
      getRows: (params: GetRowsParams) => {
        const searchParams = this.dataService.getSearchParams(
          this.columns(),
          params.startRow,
          params.endRow,
          params.sortModel.concat(this.extraSortModel()),
          params.filterModel,
          this.extraSearchQuery(),
        );

        const dataType = this.dataType();
        const index = this.index();

        return this.dataService
          .getRows<T, S>(dataType, index, searchParams, this.aggregateBy())
          .subscribe((result) => {
            params.successCallback(result.member, result.totalItems);
            this.loadData.emit({ searchParams, result });
          });
      },
    };

    this.userId = toSignal(this.userService.getCurrentLoggedInUser().pipe(map(user => user.id)));

    this.settingsKey = computed(() => (
      `${this.dataType()}${this.index() ? '-' + this.index() : ''}-table-${this.userId()}`
    ));

    effect(() => {
      this.dataType(); // trigger refresh when any of these inputs change
      this.index();
      this.columns();
      this.extraSortModel();
      this.extraSearchQuery();

      this.datatableComponent.refresh();
    });
  }
}
