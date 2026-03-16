import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  DateCellRendererComponent,
  LabelCellRendererComponent,
  URICellRendererComponent,
  BooleanFilterComponent,
  BooleanFloatingFilterComponent,
  AutocompleteFloatingFilterComponent,
  DatatableColumn,
  DatatableFilter,
  DatatableDataService,
  DocumentDatatableComponent,
} from '@kotka/ui/datatable';
import { Organization } from '@luomus/laji-schema';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { KotkaDocumentObjectType } from '@kotka/shared/models';
import { MainContentComponent } from '@kotka/ui/components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'kotka-organization-table',
  templateUrl: './organization-table.component.html',
  styleUrls: ['./organization-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MainContentComponent, FormsModule, DocumentDatatableComponent],
})
export class OrganizationTableComponent implements OnInit, OnDestroy {
  dataType = KotkaDocumentObjectType.organization;

  columns: DatatableColumn[] = [
    {
      headerName: 'URI',
      field: 'id',
      cellRenderer: URICellRendererComponent,
      width: 145,
      flex: 0,
      lockPosition: 'left',
      defaultSelected: true
    },
    {
      headerName: 'Owner',
      field: 'owner',
      flex: 2,
      cellRenderer: LabelCellRendererComponent,
      floatingFilterComponent: AutocompleteFloatingFilterComponent,
      floatingFilterComponentParams: {
        type: 'organization',
      },
      suppressFloatingFilterButton: true,
      suppressHeaderFilterButton: true,
      sortable: false
    },
    {
      headerName: 'Organization',
      field: 'organizationLevel1.en',
      flex: 3,
      sort: 'asc',
      minWidth: 145,
      defaultSelected: true
    },
    {
      headerName: 'Suborganization',
      field: 'organizationLevel2.en',
      flex: 2,
      defaultSelected: true
    },
    {
      headerName: 'Department',
      field: 'organizationLevel3.en',
      flex: 2,
      defaultSelected: true
    },
    {
      headerName: 'Section, team',
      field: 'organizationLevel4.en',
      flex: 2,
      defaultSelected: true,
    },
    {
      headerName: 'Abbr',
      field: 'abbreviation',
      defaultSelected: true,
    },
    {
      headerName: 'PC',
      field: 'postalCode',
    },
    {
      headerName: 'City',
      field: 'locality',
    },
    {
      headerName: 'Country',
      field: 'country',
    },
    {
      headerName: 'Tags',
      field: 'datasetID',
      cellRenderer: LabelCellRendererComponent,
      floatingFilterComponent: AutocompleteFloatingFilterComponent,
      floatingFilterComponentParams: {
        type: 'dataset',
      },
      suppressFloatingFilterButton: true,
      suppressHeaderFilterButton: true,
      sortable: false,
    },
    {
      headerName: 'Orders Due',
      field: 'dateOrdersDue',
      cellRenderer: DateCellRendererComponent,
      filter: 'agDateColumnFilter',
      filterParams: {
        inRangeFloatingFilterDateFormat: 'DD.MM.YYYY',
      },
    },
    {
      headerName: 'Hidden',
      field: 'hidden',
      cellRenderer: LabelCellRendererComponent,
      filter: BooleanFilterComponent,
      floatingFilterComponent: BooleanFloatingFilterComponent,
      suppressFloatingFilterButton: true,
      suppressHeaderFilterButton: true,
      width: 100,
      minWidth: 100,
      flex: 0,
      defaultSelected: true,
    }
  ];

  defaultFilterModel: DatatableFilter = {
    hidden: {
      filterType: 'boolean',
      type: 'equals',
      filter: false,
    },
  };

  extraSearchQuery?: string;

  nameFilterText = '';

  private readonly allNameFields: string[];
  private nameFilterChangedSubject = new Subject<void>();
  private updateSearchQuerySub?: Subscription;

  private dataService = inject(DatatableDataService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    const multiLangNameFields: (keyof Organization)[] = [
      'organizationLevel1',
      'organizationLevel2',
      'organizationLevel3',
      'organizationLevel4',
    ];

    this.allNameFields = ['abbreviation'];
    for (const nameField of multiLangNameFields) {
      ['en', 'fi', 'sv'].forEach((lang) => {
        this.allNameFields.push(`${nameField}.${lang}`);
      });
    }
  }

  ngOnInit() {
    this.updateSearchQuerySub = this.nameFilterChangedSubject
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.extraSearchQuery =
          this.dataService.getSearchQueryForMultiColumnTextSearch(
            this.allNameFields,
            this.nameFilterText,
          );
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.updateSearchQuerySub?.unsubscribe();
  }

  nameFilterChange() {
    this.nameFilterChangedSubject.next();
  }
}
