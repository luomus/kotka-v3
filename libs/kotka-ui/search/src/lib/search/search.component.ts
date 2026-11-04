import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { SearchBuilderComponent, createBuilderQuery } from '../search-builder/search-builder.component';
import { TextSearchComponent } from '../text-search/text-search.component';
import { queryStringToBuilderQuery } from '../services/query-parse';
import { builderQueryToQueryString } from '../services/query-stringify';
import { DialogService, toMap } from '@kotka/ui/core';
import { SearchField } from '@kotka/shared/models';
import { BuilderQuery, MultiSearchField, SearchGroup } from '../models';
import { QUERY_STRING_SUPPORTED_TYPES } from '../constants';
import { validateBuilderQueryValues } from '../services/query-validate';
import { SpinnerComponent } from '@kotka/ui/components';

type SearchMode = 'builder' | 'text';

interface BuilderQuerySnapshot {
  queryString: string;
  builderQuery: BuilderQuery;
}

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
  builderDefaultQuery = input<BuilderQuery | null>(null);

  search = output<string>();
  clear = output<void>();

  mode = signal<SearchMode>('builder');
  text = signal('');
  builderQuery = signal<BuilderQuery | null>(null);

  validFields = computed(() =>
    (this.fields() || []).filter((field) =>
      QUERY_STRING_SUPPORTED_TYPES.includes(field.type),
    ),
  );
  validFieldMap = computed(() => toMap(this.validFields(), 'field'));
  builderMultiFieldMap = computed(() =>
    toMap(this.builderMultiFields(), 'field'),
  );
  validDefaultBuilderQuery = computed(() =>
    this.getValidBuilderQuery(this.builderDefaultQuery()),
  );

  private lastBuilderSnapshot: BuilderQuerySnapshot | null = null;

  constructor() {
    effect(() => {
      if (!this.fields()) {
        return;
      }

      const searchQuery = this.searchQuery();
      untracked(() => this.onSearchQueryChange(searchQuery));
    });
  }

  setMode(mode: SearchMode) {
    if (mode === this.mode()) {
      return;
    }

    if (mode === 'builder') {
      const builderQuery = this.toBuilderQuery(this.text());

      if (!builderQuery) {
        this.dialogService.alert(
          'Query contains features that are not supported by the builder. Please use the advanced search or modify the query.',
        );
        return;
      }

      this.builderQuery.set(builderQuery);
    } else {
      this.text.set(this.toQueryString(this.builderQuery()));
    }

    this.mode.set(mode);
  }

  onSearchClick() {
    const searchQuery =
      this.mode() === 'builder'
        ? this.toQueryString(this.builderQuery())
        : this.text();

    this.search.emit(searchQuery);
  }

  onClearClick() {
    this.lastBuilderSnapshot = null;
    this.onSearchQueryChange('');
    this.clear.emit();
    this.onSearchClick();
  }

  private onSearchQueryChange(searchQuery: string) {
    const builderQuery = this.toBuilderQuery(searchQuery);

    this.text.set(searchQuery);
    this.builderQuery.set(builderQuery);

    if (!builderQuery) {
      this.mode.set('text');
    }
  }

  private toQueryString(builderQuery: BuilderQuery | null): string {
    const queryString = builderQueryToQueryString(
      builderQuery,
      this.builderMultiFieldMap(),
    );

    this.lastBuilderSnapshot = builderQuery
      ? { queryString, builderQuery }
      : null;

    return queryString;
  }

  private toBuilderQuery(queryString: string): BuilderQuery | null {
    if (queryString === this.lastBuilderSnapshot?.queryString) {
      return this.lastBuilderSnapshot.builderQuery;
    }

    if (!queryString) {
      return this.validDefaultBuilderQuery();
    }

    try {
      const builderQuery = queryStringToBuilderQuery(
        queryString,
        this.builderMultiFields(),
      );
      validateBuilderQueryValues(
        builderQuery,
        this.validFieldMap(),
        this.builderMultiFieldMap(),
      );

      return builderQuery;
    } catch (e) {
      console.warn('Failed to parse query string', e);
      return null;
    }
  }

  private getValidBuilderQuery(builderQuery: BuilderQuery | null): BuilderQuery {
    if (!builderQuery) {
      return createBuilderQuery();
    }

    const groups: SearchGroup[] = builderQuery.groups
      .map((group) => ({
        ...group,
        criteria: group.criteria.filter(
          (criteria) =>
            this.validFieldMap()[criteria.field] ||
            this.builderMultiFieldMap()[criteria.field],
        ),
      }))
      .filter((group) => group.criteria.length > 0);

    return groups.length > 0
      ? { ...builderQuery, groups }
      : createBuilderQuery();
  }
}
