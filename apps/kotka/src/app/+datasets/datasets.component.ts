import { Component, OnInit } from '@angular/core';
import { DatatableColumn, DatatableSource, GetRowsParams } from '../../../../../libs/kotka/ui/datatable/src';
import { URICellRenderer } from '../../../../../libs/kotka/ui/datatable/src/lib/renderers/uri-cell-renderer';
import { of } from 'rxjs';

@Component({
  selector: 'kotka-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.css'],
})
export class DatasetsComponent implements OnInit {
  columnDefs: DatatableColumn[] = [{
    headerName: 'URI',
    field: 'id',
    cellRenderer: URICellRenderer,
    cellRendererParams: {
      domain: 'http://tun.fi/'
    }
  }, {
    headerName: 'Name',
    field: 'datasetName',
    flex: 2
  }, {
    headerName: 'Persons responsible',
    field: 'personsResponsible',
    flex: 2
  }, {
    headerName: 'Description',
    field: 'description',
    flex: 6
  }];

  datasource: DatatableSource = {
    rowCount: 3,
    getRows: (params: GetRowsParams) => {
      const sortModel = params.sortModel;
      const filterModel = params.filterModel;
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

  constructor() {}

  ngOnInit(): void {}

  private getData() {
    return of([
      {id: 'GX.1', datasetName: 'dataset 1', personsResponsible: 'Kotka Kokoelma', description: 'kuvaus'},
      {id: 'GX.2', datasetName: 'dataset 2', personsResponsible: 'kotka', description: '...'},
      {id: 'GX.3', datasetName: 'dataset 3', personsResponsible: 'kolmas kolmonen', description: '3'}
    ]);
  }
}
