import {
  Component,
  Input,
  OnChanges,
  ViewChild,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DatatableSource,
  GetRowsParams,
  DatatableColumn,
  DatatableComponent,
  DatatableFilter,
} from '@kotka/ui/datatable';
import { DatatableDataService } from '../datatable-data.service';
import { KotkaDocumentObjectType } from '@kotka/shared/models';
import { UserService } from '@kotka/ui/data-services';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'kui-document-datatable',
  templateUrl: './document-datatable.component.html',
  styleUrls: ['./document-datatable.component.scss'],
  imports: [CommonModule, DatatableComponent]
})
export class DocumentDatatableComponent implements OnChanges {
  @ViewChild(DatatableComponent, { static: true })
  datatableComponent!: DatatableComponent;

  @Input({ required: true }) dataType!: KotkaDocumentObjectType;
  @Input() columns: DatatableColumn[] = [];

  @Input() enableFileExport? = false;
  @Input() enableColumnSelection? = false;

  @Input() dataTypeName = 'item';
  @Input() dataTypeNamePlural?: string;

  @Input() defaultFilterModel: DatatableFilter = {};

  @Input() extraSearchQuery?: string;

  datasource!: DatatableSource;
  settingsKey$!: Observable<string>;

  constructor(
    private dataService: DatatableDataService,
    private userService: UserService,
  ) {
    this.datasource = {
      getRows: (params: GetRowsParams) => {
        this.dataService
          .getData(
            this.dataType,
            this.columns,
            params.startRow,
            params.endRow,
            params.sortModel,
            params.filterModel,
            this.extraSearchQuery,
          )
          .subscribe((result) => {
            params.successCallback(result.member, result.totalItems);
          });
      },
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataType']) {
      this.settingsKey$ = this.userService
        .getCurrentLoggedInUser()
        .pipe(map((user) => `${this.dataType}-table-${user.id}`));
    }

    if (
      changes['dataType'] ||
      changes['columns'] ||
      changes['extraSearchQuery']
    ) {
      this.datatableComponent.refresh();
    }
  }
}
