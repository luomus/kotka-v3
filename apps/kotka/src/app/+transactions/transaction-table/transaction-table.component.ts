import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { DatatableColumn, DatatableSource, GetRowsParams } from '../../../../../../libs/kotka/ui/datatable/src';
import { URICellRenderer } from '../../../../../../libs/kotka/ui/datatable/src/lib/renderers/uri-cell-renderer';
import { DatatableDataService } from '../../shared/services/datatable-data.service';
import { KotkaDocumentObjectType } from '@kotka/shared/models';

@Component({
  selector: 'kotka-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionTableComponent {
  columns: DatatableColumn[] = [{
    headerName: 'URI',
    field: 'id',
    cellRenderer: URICellRenderer,
    cellRendererParams: {
      domain: 'http://tun.fi/'
    },
    hideDefaultTooltip: true
  }];

  loading = false;
  totalCount?: number;

  datasource: DatatableSource = {
    rowCount: 3,
    getRows: (params: GetRowsParams) => {
      this.loading = true;
      this.cdr.markForCheck();

      this.dataService.getData(KotkaDocumentObjectType.transaction, params.startRow, params.endRow, params.sortModel, params.filterModel).subscribe(result => {
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
