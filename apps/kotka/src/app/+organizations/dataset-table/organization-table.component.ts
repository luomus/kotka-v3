import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DateCellRendererComponent, URICellRendererComponent } from '@kotka/ui/datatable';
import { DatatableDataService, DEFAULT_DOMAIN } from '@kotka/services';
import { DatatableColumn, DatatableSource, GetRowsParams, KotkaDocumentObjectType } from '@kotka/shared/models';

@Component({
  selector: 'kotka-organization-table',
  templateUrl: './organization-table.component.html',
  styleUrls: ['./organization-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationTableComponent {
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
      this.dataService.getData(
        KotkaDocumentObjectType.organization,
        this.columns,
        params.startRow,
        params.endRow,
        params.sortModel,
        params.filterModel
      ).subscribe(result => {
        params.successCallback(result.member, result.totalItems);
      });
    }
  };

  constructor(
    private dataService: DatatableDataService
  ) { }
}
