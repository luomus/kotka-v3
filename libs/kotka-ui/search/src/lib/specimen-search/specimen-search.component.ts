import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { SearchField } from '@kotka/shared/models';
import { SearchComponent } from '../search/search.component';
import { IdSearchComponent } from '../id-search/id-search.component';
import {
  SpecimenBuilderQuery,
  SpecimenIdQuery,
  SpecimenMultiSearchField,
  SpecimenSearchQuery,
} from '../models';
import { builderQueryToQueryString } from '../services/query-stringify';
import { UserService } from '@kotka/ui/core';
import { parseIdQuery } from '../services/specimen-id-query';

@Component({
  selector: 'kui-specimen-search',
  imports: [SearchComponent, IdSearchComponent],
  templateUrl: './specimen-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenSearchComponent {
  private userService = inject(UserService);

  fields = input<SearchField[] | undefined>(undefined);

  searchQuery = model<string>('');
  idSearchText = model<string>('');

  idSearchTextParseError = signal<string>('');

  search = output<SpecimenSearchQuery>();
  clear = output<SpecimenSearchQuery>();

  builderMultiSearchFields: SpecimenMultiSearchField[] = [
    {
      field: 'taxonOrSynonyms',
      label: 'Taxon or Synonyms',
      type: 'keyword',
      fields: ['taxon', 'taxa', 'synonyms'],
      hasAutocomplete: true,
      autocompleteField: 'taxon',
    },
  ];
  builderDefaultQuery: SpecimenBuilderQuery = {
    groups: [
      {
        criteria: [
          {
            field: 'taxonOrSynonyms',
            operator: 'equals',
            value: '',
          },
          {
            field: 'originalSpecimenID',
            operator: 'equals',
            value: '',
          },
          {
            field: 'collection',
            operator: 'equals',
            value: '',
          }
        ],
        joinOperator: 'AND',
      },
    ],
    joinOperator: 'AND',
  };

  private userName = computed(() => (this.userService.formatUserName(this.userService.user()?.fullName)));

  onMyNewSpecimensClick() {
    const newQuery: SpecimenBuilderQuery = {
      groups: [
        {
          criteria: [
            {
              field: 'editor',
              operator: 'equals',
              value: this.userName() || '',
            },
            {
              field: 'dateEdited',
              operator: 'equals',
              value: new Date().toISOString().split('T')[0],
            },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    };

    this.searchQuery.set(builderQueryToQueryString(newQuery));
    this.idSearchText.set('');
    this.onSearch(this.searchQuery());
  }

  onSearch(searchQuery: string) {
    this.idSearchTextParseError.set('');

    let idSearchQuery: SpecimenIdQuery;
    try {
      idSearchQuery = parseIdQuery(this.idSearchText());
    } catch (e: any) {
      this.idSearchTextParseError.set(e?.message || 'Failed to parse ID query');
      return;
    }

    this.search.emit({
      idSearchValue: {
        text: this.idSearchText(),
        query: idSearchQuery,
      },
      textSearchQuery: searchQuery,
    });
  }

  onClear(searchQuery: string) {
    this.idSearchText.set('');
    this.idSearchTextParseError.set('');

    this.clear.emit({
      idSearchValue: {
        text: this.idSearchText(),
        query: parseIdQuery(this.idSearchText()),
      },
      textSearchQuery: searchQuery,
    });
  }
}
