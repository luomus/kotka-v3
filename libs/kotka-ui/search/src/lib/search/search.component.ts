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
import { IdSearchComponent } from '../id-search/id-search.component';
import { parseIdQuery } from '../services/id-query';
import { BuilderQuery } from '../models';

type SearchMode = 'builder' | 'text';

export interface SearchQuery {
  idSearchQuery: BuilderQuery;
  textSearchQuery: string;
}

@Component({
  selector: 'kui-search',
  imports: [SearchBuilderComponent, TextSearchComponent, IdSearchComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private dialogService = inject(DialogService);

  fields = input<SearchField[]>([]);
  showIdSearch = input<boolean>(false);

  mode = signal<SearchMode>('builder');
  idSearchText = signal<string>('');
  idSearchTextParseError = signal<string>('');
  text = signal<string>('');

  search = output<SearchQuery>();

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
    this.idSearchTextParseError.set('');

    let idSearchQuery: BuilderQuery;
    try {
      idSearchQuery = parseIdQuery(this.idSearchText());
    } catch (e: any) {
      this.idSearchTextParseError.set(e?.message || 'Failed to parse ID query');
      return;
    }

    this.search.emit({
      idSearchQuery,
      textSearchQuery: this.text(),
    });
  }

  onClearClick() {
    this.builder()?.clear();
    this.idSearchText.set('');
    this.idSearchTextParseError.set('');
    this.text.set('');
    this.onSearchClick();
  }
}
