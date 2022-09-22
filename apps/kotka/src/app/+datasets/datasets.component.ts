import { Component, OnInit } from '@angular/core';
import { DatatableColumn, DatatableSource, GetRowsParams } from '../../../../../libs/kotka/ui/datatable/src';
import { of } from 'rxjs';

@Component({
  selector: 'kotka-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.css'],
})
export class DatasetsComponent implements OnInit {
  columnDefs: DatatableColumn[] = [{
    headerName: 'URI',
    field: 'id'
  }, {
    headerName: 'Name',
    field: 'datasetName'
  }, {
    headerName: 'Persons responsible',
    field: 'personsResponsible'
  }, {
    headerName: 'Description',
    field: 'description'
  }];

  datasource: DatatableSource = {
    rowCount: 3,
    getRows: (params: GetRowsParams) => {
      const sortModel = params.sortModel;
      const filterModel = params.filterModel;
      this.getData().subscribe(data => {
        data = data.slice(params.startRow, params.endRow + 1);
        params.successCallback(data);
      });
    }
  };

  constructor() {}

  ngOnInit(): void {}

  private getData() {
    return of([
      {id: 'GX.1', datasetName: 'dataset 1', personsResponsible: 'testi', description: 'kuvaus'},
      {id: 'GX.2', datasetName: 'dataset 2', personsResponsible: 'kotka', description: '...'},
      {id: 'GX.3', datasetName: 'dataset 3', personsResponsible: 'kolmas', description: '3'}
    ]);
  }
}
