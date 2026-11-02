import {
  ChangeDetectionStrategy,
  Component, computed, effect, inject,
  input, output, Signal,
  signal, untracked,
} from '@angular/core';
import { SearchBuilderComponent, createBuilderQuery, createGroup } from '../search-builder/search-builder.component';
import { TextSearchComponent } from '../text-search/text-search.component';
import { queryStringToBuilderQuery } from '../services/query-parse';
import { builderQueryToQueryString } from '../services/query-stringify';
import { DialogService, toMap } from '@kotka/ui/core';
import { SearchField } from '@kotka/shared/models';
import { BuilderQuery, MultiSearchField } from '../models';
import { QUERY_STRING_SUPPORTED_TYPES } from '../constants';
import { validateBuilderQueryValues } from '../services/query-validate';
import { SpinnerComponent } from '@kotka/ui/components';

type SearchMode = 'builder' | 'text';

@Component({
  selector: 'kui-search',
  imports: [SearchBuilderComponent, TextSearchComponent, SpinnerComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private dialogService = inject(DialogService);

  searchQuery = input<string>('');
  fields = input<SearchField[] | undefined>(undefined);
  builderMultiFields = input<MultiSearchField[]>([]);

  mode = signal<SearchMode>('builder');
  text = signal('');
  builderQuery = signal<BuilderQuery | null>(null);
  filteredFields: Signal<SearchField[]>;

  filteredFieldMap = computed(() => toMap(this.filteredFields(), 'field'));
  builderMultiFieldMap = computed(() =>
    toMap(this.builderMultiFields(), 'field'),
  );

  search = output<string>();
  clear = output<void>();

  constructor() {
    this.filteredFields = computed(() =>
      (this.fields() || []).filter((field) =>
        QUERY_STRING_SUPPORTED_TYPES.includes(field.type),
      ),
    );

    effect(() => {
      if (!this.fields()) {
        return;
      }

      const searchQuery = this.searchQuery();

      untracked(() => {
        this.builderQuery.set(this.queryStringToValidBuilderQuery(searchQuery));
        this.text.set(searchQuery);

        if (this.mode() === 'builder' && !this.builderQuery()) {
          this.mode.set('text');
        }
      });
    });
  }

  setMode(mode: SearchMode) {
    if (mode === 'builder') {
      const builderQuery = this.queryStringToValidBuilderQuery(this.text());

      if (!builderQuery) {
        this.dialogService.alert(
          'Query contains features that are not supported by the builder. Please use the advanced search or modify the query.',
        );
        return;
      }

      this.builderQuery.set(builderQuery);
    } else {
      this.text.set(builderQueryToQueryString(this.builderQuery(), this.builderMultiFieldMap()));
    }

    this.mode.set(mode);
  }

  onSearchClick() {
    const searchQuery = this.mode() === 'builder'
      ? builderQueryToQueryString(this.builderQuery(), this.builderMultiFieldMap())
      : this.text();

    this.search.emit(searchQuery);
  }

  onClearClick() {
    this.builderQuery.set(createBuilderQuery());
    this.text.set('');
    this.clear.emit();
    this.onSearchClick();
  }

  private queryStringToValidBuilderQuery(query: string): BuilderQuery | null {
    try {
      const builderQuery = queryStringToBuilderQuery(
        query,
        this.builderMultiFields(),
      );
      validateBuilderQueryValues(
        builderQuery,
        this.filteredFieldMap(),
        this.builderMultiFieldMap(),
      );

      if (builderQuery.groups.length === 0) {
        builderQuery.groups.push(createGroup());
      }

      return builderQuery;
    } catch (e) {
      console.warn('Failed to parse query string', e);
      return null;
    }
  }
}
