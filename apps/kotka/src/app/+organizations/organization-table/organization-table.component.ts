import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent, DateCellRendererComponent, URICellRendererComponent } from '@kotka/ui/datatable';
import { DatatableDataService, DEFAULT_DOMAIN } from '@kotka/services';
import {
  DatatableColumn,
  DatatableSource,
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
    }
  }, {
    headerName: 'Organization',
    field: 'organizationLevel1.en',
    flex: 2
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
    field: 'hidden'
  }, {
    headerName: 'Tags',
    field: 'datasetID'
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
