import {
  ChangeDetectionStrategy,
  Component, computed, effect, inject,
  input, output, Signal,
  signal, untracked, viewChild,
} from '@angular/core';
import { SearchBuilderComponent } from '../search-builder/search-builder.component';
import { TextSearchComponent } from '../text-search/text-search.component';
import { queryStringToBuilderQuery } from '../services/query-parse';
import { DialogService } from '@kotka/ui/core';
import { SearchField } from '@kotka/shared/models';
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

  text = signal('');
  filteredFields: Signal<SearchField[]>;
  mode = signal<SearchMode>('builder');

  filteredFieldsMap = computed(() => this.filteredFields().reduce(
    (result, field) => {
      result[field.field] = field;
      return result;
    }, <Record<string, SearchField>>{})
  );

  search = output<string>();
  clear = output<void>();

  private builder = viewChild(SearchBuilderComponent);

  constructor() {
    this.filteredFields = computed(() => (this.fields() || []).filter(field => QUERY_STRING_SUPPORTED_TYPES.includes(field.type)));

    effect(() => {
      if (!this.fields()) {
        return;
      }

      this.text.set(this.searchQuery());

      if (untracked(this.mode) === 'builder' && !this.isValidQueryForBuilder(this.searchQuery())) {
        this.mode.set('text');
      }
    });
  }

  setMode(mode: SearchMode) {
    if (mode === 'builder' && !this.isValidQueryForBuilder(this.text())) {
      this.dialogService.alert(
        'Query contains features that are not supported by the builder. Please use the advanced search or modify the query.',
      );
    } else {
      this.mode.set(mode);
    }
  }

  onSearchClick() {
    this.search.emit(this.text());
  }

  onClearClick() {
    this.builder()?.clear();
    this.text.set('');
    this.clear.emit();
    this.onSearchClick();
  }

  private isValidQueryForBuilder(query: string): boolean {
    try {
      const builderQuery = queryStringToBuilderQuery(query);
      validateBuilderQueryValues(builderQuery, this.filteredFieldsMap());
      return true;
    } catch (e) {
      console.warn('Failed to parse query string', e);
      return false;
    }
  }
}
