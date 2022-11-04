import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatatableColumn, DatatableSource, GetRowsParams } from '../../../../../libs/kotka/ui/datatable/src';
import { URICellRenderer } from '../../../../../libs/kotka/ui/datatable/src/lib/renderers/uri-cell-renderer';
import { ApiService } from '../shared/services/api.service';
import { Observable } from 'rxjs';
import { Dataset } from '@kotka/shared/models';

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
      // const sortModel = params.sortModel;
      // const filterModel = params.filterModel;
      this.getData().subscribe(data => {
        data = data.slice(params.startRow, params.endRow);
        let lastRow = -1;
        if (data.length <= params.endRow) {
          lastRow = data.length;
        }
        params.successCallback(data, lastRow);
      });
    }
  };

  constructor(
    private apiService: ApiService
  ) { }

  private getData(): Observable<Dataset[]> {
    return this.apiService.getAllDatasets();
  }
}
