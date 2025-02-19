import { ChangeDetectionStrategy, Component } from '@angular/core';
import { URICellRendererComponent } from '@kotka/ui/datatable';
import { DatatableDataService, DEFAULT_DOMAIN } from '@kotka/services';
import { KotkaDocumentObjectType } from '@kotka/shared/models';
import { DatatableColumn, DatatableSource, GetRowsParams } from '@kotka/models';

@Component({
  selector: 'kotka-dataset-table',
  templateUrl: './dataset-table.component.html',
  styleUrls: ['./dataset-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetTableComponent {
  columns: DatatableColumn[] = [{
    headerName: 'URI',
    field: 'id',
    cellRenderer: URICellRendererComponent,
    cellRendererParams: {
      domain: DEFAULT_DOMAIN
    },
    lockPosition: 'left'
  }, {
    headerName: 'Name',
    field: 'datasetName.en',
    flex: 2
  }, {
    headerName: 'Persons responsible',
    field: 'personsResponsible',
    flex: 2
  }, {
    headerName: 'Description',
    field: 'description.en',
    flex: 6
  }];

  datasource: DatatableSource = {
    getRows: (params: GetRowsParams) => {
      this.dataService.getData(
        KotkaDocumentObjectType.dataset,
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
