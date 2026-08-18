import { Component, ViewChild, inject, output, input, effect, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DatatableSource,
  GetRowsParams,
  DatatableColumn,
  DatatableFilter, DatatableSort
} from '../models/models';
import { DatatableComponent } from '../datatable/datatable.component';
import { DocumentDatatableDataService } from '../services/document-datatable-data.service';
import {
  KotkaDocument,
  KotkaDocumentType,
  ListResponse
} from '@kotka/shared/models';
import { DataTypeNamePipePipe, DocumentListSearchParams, UserService } from '@kotka/ui/core';
import { map, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

export interface DatatableLoadedData<
  T extends KotkaDocumentType = KotkaDocumentType,
> {
  searchParams: DocumentListSearchParams<T>;
  result: ListResponse<KotkaDocument<T>>;
}

@Component({
  selector: 'kui-document-datatable',
  templateUrl: './document-datatable.component.html',
  styleUrls: ['./document-datatable.component.scss'],
  imports: [CommonModule, DatatableComponent, DataTypeNamePipePipe],
})
export class DocumentDatatableComponent<T extends KotkaDocumentType = KotkaDocumentType> {
  private dataService = inject(DocumentDatatableDataService);
  private userService = inject(UserService);

  @ViewChild(DatatableComponent, { static: true })
  datatableComponent!: DatatableComponent;

  dataType = input.required<T>();
  columns = input<DatatableColumn[]>([]);

  enableFileExport = input<boolean>();
  enableColumnSelection = input<boolean>();

  defaultFilterModel = input<DatatableFilter>({});

  extraSortModel = input<DatatableSort>([]);
  extraSearchQuery = input<string>();

  datasource: DatatableSource;
  settingsKey: Signal<string | undefined>;

  loadData = output<DatatableLoadedData<T>>();

  constructor() {
    this.datasource = {
      getRows: (params: GetRowsParams) => {
        const searchParams = this.dataService.getSearchParams(
          this.dataType(),
          this.columns(),
          params.startRow,
          params.endRow,
          params.sortModel.concat(this.extraSortModel()),
          params.filterModel,
          this.extraSearchQuery(),
        );

        this.dataService.getRows(searchParams).subscribe((result) => {
          params.successCallback(result.member, result.totalItems);
          this.loadData.emit({ searchParams, result });
        });
      },
    };

    this.settingsKey = toSignal(
      toObservable(this.dataType).pipe(
        switchMap((dataType) =>
          this.userService
            .getCurrentLoggedInUser()
            .pipe(map((user) => `${dataType}-table-${user.id}`)),
        ),
      ),
    );

    effect(() => {
      this.dataType(); // trigger refresh when any of these inputs change
      this.columns();
      this.extraSortModel();
      this.extraSearchQuery();

      this.datatableComponent.refresh();
    });
  }
}
