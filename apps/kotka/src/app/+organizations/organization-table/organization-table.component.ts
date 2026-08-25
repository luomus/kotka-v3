import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  DatatableColumn,
  DatatableFilter,
  DocumentDatatableComponent,
  DocumentDatatableDataService,
  getAutocompleteColumnOptions,
  getBooleanColumnOptions,
  getDateColumnOptions, getUriColumnOptions,
} from '@kotka/ui/datatable';
import { Organization } from '@luomus/laji-schema';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { KotkaDocumentType } from '@kotka/shared/models';
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
  dataType = KotkaDocumentType.organization;

  columns: DatatableColumn[] = [
    {
      headerName: 'URI',
      field: 'id',
      ...getUriColumnOptions(),
      lockPosition: 'left',
      defaultSelected: true,
    },
    {
      headerName: 'Owner',
      field: 'owner',
      ...getAutocompleteColumnOptions(KotkaDocumentType.organization),
      flex: 2,
      sortable: false,
    },
    {
      headerName: 'Organization',
      field: 'organizationLevel1.en',
      flex: 3,
      sort: 'asc',
      minWidth: 145,
      defaultSelected: true,
    },
    {
      headerName: 'Suborganization',
      field: 'organizationLevel2.en',
      flex: 2,
      defaultSelected: true,
    },
    {
      headerName: 'Department',
      field: 'organizationLevel3.en',
      flex: 2,
      defaultSelected: true,
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
      ...getAutocompleteColumnOptions(KotkaDocumentType.dataset),
      sortable: false,
    },
    {
      headerName: 'Orders Due',
      field: 'dateOrdersDue',
      ...getDateColumnOptions()
    },
    {
      headerName: 'Hidden',
      field: 'hidden',
      ...getBooleanColumnOptions(),
      defaultSelected: true,
    },
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

  private dataService = inject(DocumentDatatableDataService);
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
