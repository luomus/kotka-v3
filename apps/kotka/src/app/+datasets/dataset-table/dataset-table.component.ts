import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { DatatableColumn, DatatableSource, GetRowsParams} from '@kotka/ui/datatable';
import { URICellRendererComponent } from '@kotka/ui/datatable';
import { DatatableDataService } from '../../shared/services/datatable-data.service';
import { KotkaDocumentObjectType } from '@kotka/shared/models';
import { DEFAULT_DOMAIN } from '../../shared/services/id.service';

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

  loading = false;
  totalCount?: number;

  datasource: DatatableSource = {
    rowCount: 3,
    getRows: (params: GetRowsParams) => {
      this.loading = true;
      this.cdr.markForCheck();

      this.dataService.getData(KotkaDocumentObjectType.dataset, params.startRow, params.endRow, params.sortModel, params.filterModel).subscribe(result => {
        this.totalCount = result.totalItems;
        this.loading = false;
        this.cdr.markForCheck();

        params.successCallback(result.member, result.totalItems);
      });
    }
  };

  constructor(
    private dataService: DatatableDataService,
    private cdr: ChangeDetectorRef
  ) { }
}
