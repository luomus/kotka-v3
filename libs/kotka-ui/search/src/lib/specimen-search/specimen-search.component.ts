import {
  ChangeDetectionStrategy,
  Component, inject,
  input, model, output, signal,

} from '@angular/core';
import { SearchField } from '@kotka/shared/models';
import { SearchComponent } from '../search/search.component';
import { IdSearchComponent } from '../id-search/id-search.component';
import { BuilderQuery } from '../models';
import { builderQueryToQueryString } from '../services/query-stringify';
import { UserService } from '@kotka/ui/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { parseIdQuery } from '../services/specimen-id-query';

export interface IdSearchValue {
  text: string;
  query: BuilderQuery;
}

export interface SearchQuery {
  idSearchValue: IdSearchValue,
  textSearchQuery: string;
}

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

  search = output<SearchQuery>();

  private userName = toSignal(
    this.userService.getCurrentLoggedInUser().pipe(map(user => this.userService.formatUserName(user.fullName)))
  );

  onMyNewSpecimensClick() {
    const newQuery: BuilderQuery = {
      groups: [
        {
          criteria: [
            {
              field: 'editor',
              operator: 'equals',
              value: this.userName() || ''
            },
            {
              field: 'dateEdited',
              operator: 'equals',
              value: new Date().toISOString().split('T')[0]
            }
          ],
          joinOperator: 'AND'
        }
      ],
      joinOperator: 'AND'
    };

    this.searchQuery.set(builderQueryToQueryString(newQuery));
    this.idSearchText.set('');
    this.onSearch(this.searchQuery());
  }

  onSearch(searchQuery: string) {
    this.idSearchTextParseError.set('');

    let idSearchQuery: BuilderQuery;
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

  onClear() {
    this.idSearchText.set('');
    this.idSearchTextParseError.set('');
  }
}
