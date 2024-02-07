import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import {
  DatatableColumn,
  DatatableSource,
  GetRowsParams,
  LabelCellRendererComponent,
  YearCellRendererComponent
} from '@kotka/ui/datatable';
import { URICellRendererComponent, EnumCellRendererComponent } from '@kotka/ui/datatable';
import { DatatableDataService, DEFAULT_DOMAIN, FormService } from '@kotka/services';
import { KotkaDocumentObjectType, LajiForm } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';

@Component({
  selector: 'kotka-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionTableComponent {
  columns?: DatatableColumn[];

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
    private formService: FormService,
    private cdr: ChangeDetectorRef
  ) {
    this.formService.getFieldData(globals.transactionFormId).subscribe(fieldData => {
      this.setColumns(fieldData);
      this.cdr.markForCheck();
    });
  }

  private setColumns(fieldData: Record<string, LajiForm.Field>) {
    this.columns = [
      {
        headerName: 'URI',
        field: 'id',
        cellRenderer: URICellRendererComponent,
        cellRendererParams: {
          domain: DEFAULT_DOMAIN
        },
        hideDefaultTooltip: true,
        defaultSelected: true
      },
      {
        headerName: 'Team',
        field: 'owner',
        cellRenderer: LabelCellRendererComponent,
        hideDefaultTooltip: true,
        defaultSelected: true
      },
      {
        headerName: 'Transaction status',
        field: 'status',
        cellRenderer: EnumCellRendererComponent,
        cellRendererParams: {
          field: fieldData['status']
        },
        hideDefaultTooltip: true,
        defaultSelected: true
      },
      {
        headerName: 'Transaction type',
        field: 'type',
        cellRenderer: EnumCellRendererComponent,
        cellRendererParams: {
          field: fieldData['type']
        },
        hideDefaultTooltip: true
      },
      {
        headerName: 'Year received',
        field: 'incomingReceived',
        cellRenderer: YearCellRendererComponent,
        hideDefaultTooltip: true
      },
      {
        headerName: 'Corresponding organization',
        field: 'correspondentOrganization',
        cellRenderer: LabelCellRendererComponent,
        hideDefaultTooltip: true
      },
      {
        headerName: 'Collection',
        field: 'collectionID',
        cellRenderer: LabelCellRendererComponent,
        hideDefaultTooltip: true
      },
      {
        headerName: 'Correspondent',
        field: 'correspondentResearcher'
      },
      {
        headerName: 'Sender\'s transaction ID',
        field: 'externalID'
      },
      {
        headerName: 'Local researcher',
        field: 'localResearcher'
      },
      {
        headerName: 'Local person',
        field: 'localPerson'
      },
      {
        headerName: 'Material',
        field: 'material'
      },
    ];
    this.cdr.markForCheck();
  }
}
