import {
  ChangeDetectionStrategy,
  Component, inject,
  input, output,
  signal, viewChild,
} from '@angular/core';
import { SearchBuilderComponent } from '../search-builder/search-builder.component';
import { TextSearchComponent } from '../text-search/text-search.component';
import { queryStringToBuilderQuery } from '../services/query-parse';
import { DialogService } from '@kotka/ui/core';
import { SearchField } from '@kotka/shared/models';

type SearchMode = 'builder' | 'text';

@Component({
  selector: 'kui-search',
  imports: [SearchBuilderComponent, TextSearchComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private dialogService = inject(DialogService);

  fields = input<SearchField[]>([]);

  mode = signal<SearchMode>('builder');
  text = signal<string>('');

  search = output<string>();

  private builder = viewChild(SearchBuilderComponent);

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
    this.onSearchClick();
  }
}
