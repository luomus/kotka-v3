import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatatableColumn, DocumentDatatableComponent, getUriColumnOptions } from '@kotka/ui/datatable';
import { KotkaDocumentType } from '@kotka/shared/models';
import { MainContentComponent } from '@kotka/ui/components';

@Component({
  selector: 'kotka-dataset-table',
  templateUrl: './dataset-table.component.html',
  styleUrls: ['./dataset-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MainContentComponent, DocumentDatatableComponent],
})
export class DatasetTableComponent {
  dataType = KotkaDocumentType.dataset;

  columns: DatatableColumn[] = [
    {
      headerName: 'URI',
      field: 'id',
      ...getUriColumnOptions(),
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
