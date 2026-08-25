import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  DatatableColumn,
  DateCellRendererComponent,
  DocumentDatatableComponent,
  DueDaysRendererComponent,
  getAutocompleteColumnOptions,
  getDateColumnOptions,
  getEnumColumnOptions, getUriColumnOptions,
  TransactionCountRendererComponent,
  YearFloatingFilterComponent
} from '@kotka/ui/datatable';
import { FormService } from '@kotka/ui/core';
import { KotkaDocumentType, LajiForm } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { MainContentComponent, SpinnerComponent } from '@kotka/ui/components';


@Component({
  selector: 'kotka-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MainContentComponent,
    SpinnerComponent,
    DocumentDatatableComponent
],
})
export class TransactionTableComponent {
  dataType = KotkaDocumentType.transaction;

  columns?: DatatableColumn[];

  private formService = inject(FormService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.formService
      .getFieldData(globals.transactionFormId)
      .subscribe((fieldData) => {
        this.columns = this.getColumns(fieldData);
        this.cdr.markForCheck();
      });
  }

  private getColumns(
    fieldData: Record<string, LajiForm.Field>,
  ): DatatableColumn[] {
    return [
      {
        headerName: 'URI',
        field: 'id',
        ...getUriColumnOptions(),
        defaultSelected: true,
        lockPosition: 'left',
      },
      {
        headerName: 'Owner',
        field: 'owner',
        ...getAutocompleteColumnOptions(KotkaDocumentType.organization),
        defaultSelected: true,
        rememberFilters: true,
        lockPosition: 'left',
      },
      {
        headerName: 'Transaction status',
        field: 'status',
        ...getEnumColumnOptions(fieldData['status'].options?.value_options),
        defaultSelected: true,
      },
      {
        headerName: 'Transaction type',
        field: 'type',
        ...getEnumColumnOptions(fieldData['type'].options?.value_options),
        defaultSelected: true,
      },
      {
        headerName: 'Outgoing sent',
        field: 'outgoingSent',
        ...getDateColumnOptions()
      },
      {
        colId: 'outgoingSentYear',
        headerName: 'Outgoing sent year',
        field: 'outgoingSent',
        cellRenderer: DateCellRendererComponent,
        cellRendererParams: {
          format: 'yyyy',
        },
        filter: 'agDateColumnFilter',
        floatingFilterComponent: YearFloatingFilterComponent,
        suppressFloatingFilterButton: true,
        suppressHeaderFilterButton: true,
      },
      {
        headerName: 'Incoming received',
        field: 'incomingReceived',
        ...getDateColumnOptions()
      },
      {
        colId: 'incomingReceivedYear',
        headerName: 'Incoming received year',
        field: 'incomingReceived',
        cellRenderer: DateCellRendererComponent,
        cellRendererParams: {
          format: 'yyyy',
        },
        filter: 'agDateColumnFilter',
        floatingFilterComponent: YearFloatingFilterComponent,
        suppressFloatingFilterButton: true,
        suppressHeaderFilterButton: true,
      },
      {
        headerName: 'Counterparty organization',
        field: 'correspondentOrganization',
        ...getAutocompleteColumnOptions(KotkaDocumentType.organization),
        defaultSelected: true,
      },
      {
        headerName: 'Collection',
        field: 'collectionID',
        ...getAutocompleteColumnOptions('collection')
      },
      {
        headerName: 'Counterparty researcher',
        field: 'correspondentResearcher',
      },
      {
        headerName: 'Counterparty person/contact info',
        field: 'correspondentPerson',
      },
      {
        headerName: 'Sender\'s transaction ID',
        field: 'externalID',
      },
      {
        headerName: 'Local researcher',
        field: 'localResearcher',
      },
      {
        headerName: 'Local person',
        field: 'localPerson',
      },
      {
        headerName: 'Material description',
        field: 'material',
      },
      {
        colId: 'balance',
        headerName: 'Balance',
        cellRenderer: TransactionCountRendererComponent,
        cellRendererParams: {
          type: 'balance',
        },
        sortable: false,
        filter: false,
      },
      {
        colId: 'totalCount',
        headerName: 'Total count',
        cellRenderer: TransactionCountRendererComponent,
        cellRendererParams: {
          type: 'total',
        },
        sortable: false,
        filter: false,
      },
      {
        colId: 'returnedCount',
        headerName: 'Returned count',
        cellRenderer: TransactionCountRendererComponent,
        cellRendererParams: {
          type: 'returned',
        },
        sortable: false,
        filter: false,
      },
      {
        colId: 'dueDays',
        headerName: 'Due days',
        field: 'dueDate',
        cellRenderer: DueDaysRendererComponent,
        filter: false,
      },
      {
        headerName: 'Old transaction number',
        field: 'legacyID',
      },
    ];
  }
}
