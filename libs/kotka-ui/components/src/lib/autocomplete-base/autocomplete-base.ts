import {
  Directive,
  effect,
  input,
  model,
  signal,
  TemplateRef,
  untracked,
} from '@angular/core';
import { AutocompleteResult } from '@kotka/shared/models';
import {
  catchError,
  defer,
  finalize,
  map,
  Observable,
  of,
} from 'rxjs';

export type FetchAutocompleteResultsFunc = (
  term: string,
) => Observable<AutocompleteResult[]>;

@Directive()
export abstract class AutocompleteBaseComponent {
  value = model<string>();
  fetchResultsFunc = input.required<FetchAutocompleteResultsFunc>();
  placeholder = input('Search...');
  minCharacters = input(1);
  resultTemplate = input<TemplateRef<any>>();
  showSuggestionsLoadingSpinner = input(true);

  loading = signal(false);
  suggestionsLoading = signal(false);

  constructor() {
    effect(() => {
      const value = this.value();
      untracked(() => this.onValueChange(value));
    });
  }

  protected abstract onValueChange(value?: string): void;

  protected fetchSuggestions(
    term: string,
  ): Observable<AutocompleteResult[]> {
    const searchTerm = term ?? '';
    if (searchTerm.length < this.minCharacters()) {
      return of([]);
    }

    return defer(() => {
      this.suggestionsLoading.set(true);
      return this.fetchResultsFunc()(searchTerm);
    }).pipe(
      catchError(() => of([])),
      finalize(() => this.suggestionsLoading.set(false)),
    );
  }

  protected getSuggestionFromKey(
    key: string,
  ): Observable<AutocompleteResult | undefined> {
    return defer(() => {
      this.loading.set(true);
      return this.fetchResultsFunc()(key);
    })
      .pipe(
        map((results) => results.find((r) => r.key === key)),
        finalize(() => this.loading.set(false)),
      );
  }
}
