import {
  ChangeDetectionStrategy,
  Component, computed, inject,
  input, model, output, Signal,
  signal, viewChild,
} from '@angular/core';
import { SearchBuilderComponent } from '../search-builder/search-builder.component';
import { TextSearchComponent } from '../text-search/text-search.component';
import { queryStringToBuilderQuery } from '../services/query-parse';
import { DialogService } from '@kotka/ui/core';
import { SearchField } from '@kotka/shared/models';
import { QUERY_STRING_SUPPORTED_TYPES } from '../constants';

type SearchMode = 'builder' | 'text';

@Component({
  selector: 'kui-search',
  imports: [SearchBuilderComponent, TextSearchComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private dialogService = inject(DialogService);

  text = model<string>('');
  fields = input<SearchField[]>([]);

  filteredFields: Signal<SearchField[]>;
  mode = signal<SearchMode>('builder');

  search = output<string>();
  clear = output<void>();

  private builder = viewChild(SearchBuilderComponent);

  constructor() {
    this.filteredFields = computed(() => this.fields().filter(field => QUERY_STRING_SUPPORTED_TYPES.includes(field.type)));
  }

  setMode(mode: SearchMode) {
    if (mode === 'builder') {
      try {
        queryStringToBuilderQuery(this.text());
      } catch (e) {
        console.warn('Failed to parse query string', e);
        this.dialogService.alert(
          'Query contains features that are not supported by the builder. Please use the advanced search or modify the query.',
        );
        return;
      }
    }
    this.mode.set(mode);
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
}
