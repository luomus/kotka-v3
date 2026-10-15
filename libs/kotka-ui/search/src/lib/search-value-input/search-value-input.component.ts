import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AutocompleteResult,
  KotkaDocumentType,
  SearchField,
} from '@kotka/shared/models';
import { AutocompleteComponent, DatepickerComponent } from '@kotka/ui/components';
import { ApiClient, HighlightMatchPipe } from '@kotka/ui/core';
import { catchError, map, Observable, of } from 'rxjs';
import { BOOLEAN_TYPES, DATE_TYPES } from '../constants';

const SUGGESTION_LIMIT = 10;

type ValueInputType = 'date' | 'boolean' | 'autocomplete' | 'text';

@Component({
  selector: 'kui-search-value-input',
  templateUrl: './search-value-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    DatepickerComponent,
    AutocompleteComponent,
    HighlightMatchPipe,
  ],
})
export class SearchValueInputComponent {
  private apiClient = inject(ApiClient);

  field = input<SearchField>();
  value = model<string>('');
  placeholder = input('Value');

  inputType = computed<ValueInputType>(() => {
    const field = this.field();

    if (!field) {
      return 'text';
    }
    if (DATE_TYPES.includes(field.type)) {
      return 'date';
    }
    if (BOOLEAN_TYPES.includes(field.type)) {
      return 'boolean';
    }
    return field.hasAutocomplete ? 'autocomplete' : 'text';
  });

  fetchResultsFunc = this.fetchResults.bind(this);

  private fetchResults(term: string): Observable<AutocompleteResult[]> {
    const field = this.field();

    if (!field) {
      return of([]);
    }

    return this.apiClient
      .getSearchAutocomplete(
        KotkaDocumentType.specimen,
        field.field,
        term,
        SUGGESTION_LIMIT,
      )
      .pipe(
        map((values) => values.map((value) => ({ key: value, value }))),
        catchError(() => of([])),
      );
  }
}
