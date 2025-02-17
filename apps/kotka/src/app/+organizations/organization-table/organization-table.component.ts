import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  DatatableComponent,
  DateCellRendererComponent,
  LabelCellRendererComponent,
  URICellRendererComponent,
  BooleanFilterComponent, BooleanFloatingFilterComponent, AutocompleteFloatingFilterComponent
} from '@kotka/ui/datatable';
import { DatatableDataService, DEFAULT_DOMAIN } from '@kotka/services';
import {
  DatatableColumn,
  DatatableSource,
  FilterModel,
  GetRowsParams,
  KotkaDocumentObjectType
} from '@kotka/shared/models';
import { Organization } from '@luomus/laji-schema';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'kotka-organization-table',
  templateUrl: './organization-table.component.html',
  styleUrls: ['./organization-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationTableComponent implements OnInit, OnDestroy {
  @ViewChild(DatatableComponent, { static: true }) datatableComponent!: DatatableComponent;

  columns: DatatableColumn[] = [{
    headerName: 'URI',
    field: 'id',
    cellRenderer: URICellRendererComponent,
    cellRendererParams: {
      domain: DEFAULT_DOMAIN
    },
    width: 145,
    flex: 0,
    lockPosition: 'left'
  }, {
    headerName: 'Organization',
    field: 'organizationLevel1.en',
    flex: 2,
    sort: 'asc'
  }, {
    headerName: 'Suborganization',
    field: 'organizationLevel2.en',
    flex: 2
  }, {
    headerName: 'Department',
    field: 'organizationLevel3.en',
    flex: 2
  }, {
    headerName: 'Section, team',
    field: 'organizationLevel4.en',
    flex: 2
  }, {
    headerName: 'Abbr',
    field: 'abbreviation'
  }, {
    headerName: 'PC',
    field: 'postalCode'
  }, {
    headerName: 'Hidden',
    field: 'hidden',
    cellRenderer: LabelCellRendererComponent,
    filter: BooleanFilterComponent,
    floatingFilterComponent: BooleanFloatingFilterComponent,
    suppressFloatingFilterButton: true,
    width: 100,
    minWidth: 100,
    flex: 0
  }, {
    headerName: 'Tags',
    field: 'datasetID',
    cellRenderer: LabelCellRendererComponent,
    floatingFilterComponent: AutocompleteFloatingFilterComponent,
    floatingFilterComponentParams: {
      type: 'dataset'
    },
    suppressFloatingFilterButton: true,
    sortable: false
  }, {
    headerName: 'Orders Due',
    field: 'dateOrdersDue',
    cellRenderer: DateCellRendererComponent,
    filter: 'agDateColumnFilter',
    filterParams: {
      inRangeFloatingFilterDateFormat: 'DD.MM.YYYY'
    }
  }];

  datasource: DatatableSource = {
    getRows: (params: GetRowsParams) => {
      const searchQuery = this.dataService.getSearchQueryForMultiColumnTextSearch(
        this.allNameFields,
        this.nameFilterText
      );

      this.dataService.getData(
        KotkaDocumentObjectType.organization,
        this.columns,
        params.startRow,
        params.endRow,
        params.sortModel,
        params.filterModel,
        searchQuery
      ).subscribe(result => {
        params.successCallback(result.member, result.totalItems);
      });
    }
  };

  defaultFilterModel: FilterModel = {
    hidden: {
      filterType: 'boolean',
      type: 'equals',
      filter: false
    }
  };

  nameFilterText = '';

  private readonly allNameFields: string[];
  private datatableRefreshSubject = new Subject<void>();
  private datatableRefreshSub?: Subscription;

  constructor(
    private dataService: DatatableDataService
  ) {
    const multiLangNameFields: (keyof Organization)[] = [
      'organizationLevel1',
      'organizationLevel2',
      'organizationLevel3',
      'organizationLevel4'
    ];

    this.allNameFields = ['abbreviation'];
    for (const nameField of multiLangNameFields) {
      ['en', 'fi', 'sv'].forEach(lang => {
        this.allNameFields.push(`${nameField}.${lang}`);
      });
    }
  }

  ngOnInit() {
    this.datatableRefreshSub = this.datatableRefreshSubject.pipe(debounceTime(500)).subscribe(() => {
      this.datatableComponent.refresh();
    });
  }

  ngOnDestroy() {
    this.datatableRefreshSub?.unsubscribe();
  }

  nameFilterChange() {
    this.datatableRefreshSubject.next();
  }
}
