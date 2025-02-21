import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {
  LabelCellRendererComponent,
  DateCellRendererComponent,
  TransactionCountRendererComponent,
  DueDaysRendererComponent,
  EnumFloatingFilterComponent,
  YearFloatingFilterComponent,
  DatatableColumn,
} from '@kotka/ui/datatable';
import {
  URICellRendererComponent,
  EnumCellRendererComponent,
  AutocompleteFloatingFilterComponent,
} from '@kotka/ui/datatable';
import { FormService } from '@kotka/ui/data-services';
import { KotkaDocumentObjectType, LajiForm } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { MainContentComponent } from '@kotka/ui/main-content';
import { SpinnerComponent } from '@kotka/ui/spinner';
import { DocumentDatatableComponent } from '@kotka/ui/document-datatable';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kotka-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MainContentComponent, SpinnerComponent, DocumentDatatableComponent],
})
export class TransactionTableComponent {
  dataType = KotkaDocumentObjectType.transaction;

  columns?: DatatableColumn[];

  constructor(
    private formService: FormService,
    private cdr: ChangeDetectorRef,
  ) {
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
        cellRenderer: URICellRendererComponent,
        defaultSelected: true,
        lockPosition: 'left',
      },
      {
        headerName: 'Owner',
        field: 'owner',
        cellRenderer: LabelCellRendererComponent,
        floatingFilterComponent: AutocompleteFloatingFilterComponent,
        floatingFilterComponentParams: {
          type: 'organization',
        },
        suppressFloatingFilterButton: true,
        sortable: false,
        defaultSelected: true,
        rememberFilters: true,
        lockPosition: 'left',
      },
      {
        headerName: 'Transaction status',
        field: 'status',
        cellRenderer: EnumCellRendererComponent,
        cellRendererParams: {
          field: fieldData['status'],
        },
        floatingFilterComponent: EnumFloatingFilterComponent,
        floatingFilterComponentParams: {
          field: fieldData['status'],
        },
        suppressFloatingFilterButton: true,
        defaultSelected: true,
      },
      {
        headerName: 'Transaction type',
        field: 'type',
        cellRenderer: EnumCellRendererComponent,
        cellRendererParams: {
          field: fieldData['type'],
        },
        floatingFilterComponent: EnumFloatingFilterComponent,
        floatingFilterComponentParams: {
          field: fieldData['type'],
        },
        suppressFloatingFilterButton: true,
        defaultSelected: true,
      },
      {
        headerName: 'Outgoing sent',
        field: 'outgoingSent',
        cellRenderer: DateCellRendererComponent,
        filter: 'agDateColumnFilter',
        filterParams: {
          inRangeFloatingFilterDateFormat: 'DD.MM.YYYY',
        },
      },
      {
        colId: 'outgoingSentYear',
        headerName: 'Outgoing sent year',
        field: 'outgoingSent',
        cellRenderer: DateCellRendererComponent,
        cellRendererParams: {
          format: 'YYYY',
        },
        filter: 'agDateColumnFilter',
        floatingFilterComponent: YearFloatingFilterComponent,
        suppressFloatingFilterButton: true,
      },
      {
        headerName: 'Incoming received',
        field: 'incomingReceived',
        cellRenderer: DateCellRendererComponent,
        filter: 'agDateColumnFilter',
        filterParams: {
          inRangeFloatingFilterDateFormat: 'DD.MM.YYYY',
        },
      },
      {
        colId: 'incomingReceivedYear',
        headerName: 'Incoming received year',
        field: 'incomingReceived',
        cellRenderer: DateCellRendererComponent,
        cellRendererParams: {
          format: 'YYYY',
        },
        filter: 'agDateColumnFilter',
        floatingFilterComponent: YearFloatingFilterComponent,
        suppressFloatingFilterButton: true,
      },
      {
        headerName: 'Counterparty organization',
        field: 'correspondentOrganization',
        cellRenderer: LabelCellRendererComponent,
        floatingFilterComponent: AutocompleteFloatingFilterComponent,
        floatingFilterComponentParams: {
          type: 'organization',
        },
        suppressFloatingFilterButton: true,
        sortable: false,
        defaultSelected: true,
      },
      {
        headerName: 'Collection',
        field: 'collectionID',
        cellRenderer: LabelCellRendererComponent,
        floatingFilterComponent: AutocompleteFloatingFilterComponent,
        floatingFilterComponentParams: {
          type: 'collection',
        },
        suppressFloatingFilterButton: true,
        sortable: false,
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
        headerName: "Sender's transaction ID",
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
