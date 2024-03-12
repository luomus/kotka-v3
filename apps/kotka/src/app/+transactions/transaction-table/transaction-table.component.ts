import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import {
  LabelCellRendererComponent,
  DateCellRendererComponent,
  TransactionCountRendererComponent, DueDaysRendererComponent, EnumFloatingFilterComponent, YearFloatingFilterComponent
} from '@kotka/ui/datatable';
import { URICellRendererComponent, EnumCellRendererComponent, AutocompleteFloatingFilterComponent } from '@kotka/ui/datatable';
import { DatatableDataService, DEFAULT_DOMAIN, FormService } from '@kotka/services';
import {
  DatatableColumn,
  DatatableSource,
  GetRowsParams,
  KotkaDocumentObjectType,
  LajiForm
} from '@kotka/shared/models';
import { globals } from '../../../environments/globals';

@Component({
  selector: 'kotka-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionTableComponent {
  columns?: DatatableColumn[];

  datasource?: DatatableSource;

  constructor(
    private dataService: DatatableDataService,
    private formService: FormService,
    private cdr: ChangeDetectorRef
  ) {
    this.formService.getFieldData(globals.transactionFormId).subscribe(fieldData => {
      this.columns = this.getColumns(fieldData);
      this.datasource = this.getDatasource(this.columns);
      this.cdr.markForCheck();
    });
  }

  private getColumns(fieldData: Record<string, LajiForm.Field>): DatatableColumn[] {
    return [
      {
        headerName: 'URI',
        field: 'id',
        cellRenderer: URICellRendererComponent,
        cellRendererParams: {
          domain: DEFAULT_DOMAIN
        },
        defaultSelected: true
      },
      {
        headerName: 'Team',
        field: 'owner',
        cellRenderer: LabelCellRendererComponent,
        floatingFilterComponent: AutocompleteFloatingFilterComponent,
        floatingFilterComponentParams: {
          type: 'organization'
        },
        suppressFloatingFilterButton: true,
        sortable: false,
        defaultSelected: true
      },
      {
        headerName: 'Transaction status',
        field: 'status',
        cellRenderer: EnumCellRendererComponent,
        cellRendererParams: {
          field: fieldData['status']
        },
        floatingFilterComponent: EnumFloatingFilterComponent,
        floatingFilterComponentParams: {
          field: fieldData['status']
        },
        suppressFloatingFilterButton: true,
        defaultSelected: true
      },
      {
        headerName: 'Transaction type',
        field: 'type',
        cellRenderer: EnumCellRendererComponent,
        cellRendererParams: {
          field: fieldData['type']
        },
        floatingFilterComponent: EnumFloatingFilterComponent,
        floatingFilterComponentParams: {
          field: fieldData['type']
        },
        suppressFloatingFilterButton: true
      },
      {
        headerName: 'Outgoing sent',
        field: 'outgoingSent',
        cellRenderer: DateCellRendererComponent,
        filter: 'agDateColumnFilter',
        filterParams: {
          inRangeFloatingFilterDateFormat: 'DD.MM.YYYY'
        }
      },
      {
        colId: 'outgoingSentYear',
        headerName: 'Outgoing sent year',
        field: 'outgoingSent',
        cellRenderer: DateCellRendererComponent,
        cellRendererParams: {
          format: 'YYYY'
        },
        filter: 'agDateColumnFilter',
        floatingFilterComponent: YearFloatingFilterComponent,
        suppressFloatingFilterButton: true
      },
      {
        headerName: 'Incoming received',
        field: 'incomingReceived',
        cellRenderer: DateCellRendererComponent,
        filter: 'agDateColumnFilter',
        filterParams: {
          inRangeFloatingFilterDateFormat: 'DD.MM.YYYY'
        }
      },
      {
        colId: 'incomingReceivedYear',
        headerName: 'Incoming received year',
        field: 'incomingReceived',
        cellRenderer: DateCellRendererComponent,
        cellRendererParams: {
          format: 'YYYY'
        },
        filter: 'agDateColumnFilter',
        floatingFilterComponent: YearFloatingFilterComponent,
        suppressFloatingFilterButton: true
      },
      {
        headerName: 'Counterparty organization',
        field: 'correspondentOrganization',
        cellRenderer: LabelCellRendererComponent,
        floatingFilterComponent: AutocompleteFloatingFilterComponent,
        floatingFilterComponentParams: {
          type: 'organization'
        },
        suppressFloatingFilterButton: true,
        sortable: false
      },
      {
        headerName: 'Collection',
        field: 'collectionID',
        cellRenderer: LabelCellRendererComponent,
        floatingFilterComponent: AutocompleteFloatingFilterComponent,
        floatingFilterComponentParams: {
          type: 'collection'
        },
        suppressFloatingFilterButton: true,
        sortable: false
      },
      {
        headerName: 'Counterparty researcher',
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
      {
        colId: 'balance',
        headerName: 'Balance',
        cellRenderer: TransactionCountRendererComponent,
        cellRendererParams: {
          type: 'balance'
        },
        sortable: false,
        filter: false
      },
      {
        colId: 'totalCount',
        headerName: 'Total count',
        cellRenderer: TransactionCountRendererComponent,
        cellRendererParams: {
          type: 'total'
        },
        sortable: false,
        filter: false
      },
      {
        colId: 'returnedCount',
        headerName: 'Returned count',
        cellRenderer: TransactionCountRendererComponent,
        cellRendererParams: {
          type: 'returned'
        },
        sortable: false,
        filter: false
      },
      {
        colId: 'dueDays',
        headerName: 'Due days',
        field: 'dueDate',
        cellRenderer: DueDaysRendererComponent,
        filter: false
      },
      {
        headerName: 'Old transaction number',
        field: 'legacyID'
      }
    ];
  }

  private getDatasource(columns: DatatableColumn[]): DatatableSource {
    return {
      getRows: (params: GetRowsParams) => {
        this.dataService.getData(
          KotkaDocumentObjectType.transaction,
          columns,
          params.startRow,
          params.endRow,
          params.sortModel,
          params.filterModel
        ).subscribe(result => {
          params.successCallback(result.member, result.totalItems);
        });
      }
    };
  }
}
