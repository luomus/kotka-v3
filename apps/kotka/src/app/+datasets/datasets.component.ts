import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatatableColumn, DatatableSource, GetRowsParams} from '../../../../../libs/kotka/ui/datatable/src';
import { URICellRenderer } from '../../../../../libs/kotka/ui/datatable/src/lib/renderers/uri-cell-renderer';
import { DataType } from '../shared/services/api.service';
import { DatatableDataService } from '../shared/services/datatable-data.service';

@Component({
  selector: 'kotka-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetsComponent {
  columns: DatatableColumn[] = [{
    headerName: 'URI',
    field: 'id',
    cellRenderer: URICellRenderer,
    cellRendererParams: {
      domain: 'http://tun.fi/'
    },
    hideDefaultTooltip: true
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
    rowCount: 3,
    getRows: (params: GetRowsParams) => {
      this.dataService.getData(DataType.dataset, params.startRow, params.endRow, params.sortModel, params.filterModel).subscribe(result => {
        params.successCallback(result.member, result.totalItems);
      });
    }
  };

  constructor(
    private dataService: DatatableDataService
  ) { }
}
