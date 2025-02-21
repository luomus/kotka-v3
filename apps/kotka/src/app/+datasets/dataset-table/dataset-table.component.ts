import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatatableColumn, URICellRendererComponent } from '@kotka/ui/datatable';
import { KotkaDocumentObjectType } from '@kotka/shared/models';

@Component({
  selector: 'kotka-dataset-table',
  templateUrl: './dataset-table.component.html',
  styleUrls: ['./dataset-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetTableComponent {
  dataType = KotkaDocumentObjectType.dataset;

  columns: DatatableColumn[] = [
    {
      headerName: 'URI',
      field: 'id',
      cellRenderer: URICellRendererComponent,
      lockPosition: 'left',
    },
    {
      headerName: 'Name',
      field: 'datasetName.en',
      flex: 2,
    },
    {
      headerName: 'Persons responsible',
      field: 'personsResponsible',
      flex: 2,
    },
    {
      headerName: 'Description',
      field: 'description.en',
      flex: 6,
    },
  ];
}
