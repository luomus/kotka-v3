import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  Signal,
  signal,
} from '@angular/core';
import { KotkaDocumentType, SearchField } from '@kotka/shared/models';
import {
  AutocompleteTextareaComponent,
  AutocompleteTextareaSuggestion,
} from '@kotka/ui/components';
import { ApiClient } from '@kotka/ui/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

interface FieldValueContext {
  field: string;
  query: string;
}

interface TokenInfo {
  token: string;
  isInsideQuotes: boolean;
}

interface CurrentTokenInfo {
  previous?: TokenInfo;
  current: TokenInfo;
  separator?: string;
}

const JOIN_OPERATOR_SUGGESTIONS: AutocompleteTextareaSuggestion[] = [
  { value: 'AND', suffix: ' ' },
  { value: 'OR', suffix: ' ' },
];

const SPECIAL_OPERATOR_SUGGESTIONS: AutocompleteTextareaSuggestion[] = [
  { value: '_exists_', suffix: ': "' },
];

const SUGGESTION_LIMIT = 10;

@Component({
  selector: 'kui-text-search',
  imports: [AutocompleteTextareaComponent],
  templateUrl: './text-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextSearchComponent {
  private apiClient = inject(ApiClient);

  fields = input<SearchField[]>([]);

  text = model<string>('');

  currentToken = signal('');
  suggestions = signal<AutocompleteTextareaSuggestion[]>([]);
  suggestionsLoading = signal(false);

  private fieldNames: Signal<string[]>;
  private fieldFilterSuggestions: Signal<AutocompleteTextareaSuggestion[]>;
  private fieldValueSuggestions: Signal<AutocompleteTextareaSuggestion[]>;

  private fieldValueContext$ = new Subject<FieldValueContext | null>();

  constructor() {
    this.fieldNames = computed(() => this.fields().map((field) => field.field));

    this.fieldFilterSuggestions = computed<AutocompleteTextareaSuggestion[]>(() =>
      this.fields().map((field) => ({
        value: field.field,
        suffix: ': "',
      })),
    );

    this.fieldValueSuggestions = computed<AutocompleteTextareaSuggestion[]>(() =>
      this.fields().map((field) => ({
        value: field.field,
        suffix: '" ',
      })),
    );

    this.fieldValueContext$
      .pipe(
        distinctUntilChanged(
          (a, b) => a?.field === b?.field && a?.query === b?.query,
        ),
        tap(context => (this.suggestionsLoading.set(!!context))),
        debounceTime(200),
        switchMap((context): Observable<AutocompleteTextareaSuggestion[] | null> => {
          if (!context) {
            return of(null);
          }
          return this.getAutocompleteValues(context.field, context.query).pipe(
            map(values => values.map(value => ({ value, suffix: '" ' }))),
            catchError(() => of([])),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((suggestions) => {
        if (suggestions) {
          this.suggestions.set(suggestions);
        }
        this.suggestionsLoading.set(false);
      });
  }

  updateSuggestions(textBeforeCursor: string) {
    const { current, previous, separator } = this.getCurrentTokenInfo(textBeforeCursor);

    this.currentToken.set(current.token);

    const suggestions = this.getSuggestions(current, previous, separator);

    if (suggestions === null) {
      this.suggestions.set([]);
      return;
    }

    this.fieldValueContext$.next(null);
    this.suggestions.set(this.filterAndSort(suggestions, current.token));
  }

  private getSuggestions(
    tokenInfo: TokenInfo,
    previousTokenInfo?: TokenInfo,
    separator?: string
  ): AutocompleteTextareaSuggestion[] | null {
    const token = tokenInfo.token;
    const previousToken = previousTokenInfo?.token;

    if (token.startsWith('_')) {
      return SPECIAL_OPERATOR_SUGGESTIONS;
    }

    if (previousToken?.endsWith(':') && !previousTokenInfo?.isInsideQuotes) {
      if (tokenInfo.isInsideQuotes) {
        const field = previousToken?.slice(0, -1);
        if (field === '_exists_') {
          return this.fieldValueSuggestions();
        }

        if (!this.fieldNames().includes(field)) {
          return [];
        }

        this.fieldValueContext$.next({ field, query: token });
        return null;
      }

      return [];
    }

    const hasSpaceSeparator = !!separator && /\s/.test(separator);

    if (
      !previousTokenInfo ||
      ((hasSpaceSeparator || separator === '(') && ['AND', 'OR', 'NOT'].includes(previousTokenInfo.token))
    ) {
      return token.length > 0 ? this.fieldFilterSuggestions() : [];
    }

    return hasSpaceSeparator ? JOIN_OPERATOR_SUGGESTIONS : [];
  }

  private getCurrentTokenInfo(textBeforeCursor: string): CurrentTokenInfo {
    let tokenAfterQuote = '';
    let otherToken = '';

    let isInsideQuotes = false;
    let nextIsEscaped = false;

    let previousTokenInfo: TokenInfo | undefined = undefined;
    let separator: string | undefined = undefined;

    const reset = () => {
      if (isInsideQuotes) {
        previousTokenInfo = { token: tokenAfterQuote, isInsideQuotes: true };
      } else if (otherToken) {
        previousTokenInfo = { token: otherToken, isInsideQuotes: false };
      }

      tokenAfterQuote = '';
      otherToken = '';
      separator = undefined;
    };

    for (const char of textBeforeCursor) {
      if (!nextIsEscaped && char === '"') {
        reset();
        isInsideQuotes = !isInsideQuotes;
      } else if (isInsideQuotes) {
        tokenAfterQuote += char;
      } else if (!nextIsEscaped && /[\s()]/.test(char)) {
        reset();
        separator = char;
      } else {
        otherToken += char;
      }

      nextIsEscaped = char === '\\' && !nextIsEscaped;
    }

    if (isInsideQuotes) {
      return { previous: previousTokenInfo, current: { token: tokenAfterQuote, isInsideQuotes: true }, separator };
    } else {
      return { previous: previousTokenInfo, current: { token: otherToken, isInsideQuotes: false }, separator };
    }
  }

  private filterAndSort(
    candidates: AutocompleteTextareaSuggestion[],
    token: string,
  ): AutocompleteTextareaSuggestion[] {
    const term = token.toLowerCase();

    return candidates
      .filter((candidate) => candidate.value.toLowerCase().includes(term))
      .sort(
        (a, b) => this.scoreMatch(a, term) - this.scoreMatch(b, term),
      )
      .slice(0, SUGGESTION_LIMIT);
  }

  private scoreMatch(suggestion: AutocompleteTextareaSuggestion, term: string): number {
    return suggestion.value.toLowerCase().startsWith(term) ? 0 : 1;
  }

  private getAutocompleteValues(field: string, query: string): Observable<string[]> {
    return this.apiClient.getSearchAutocomplete(KotkaDocumentType.specimen, field, query, SUGGESTION_LIMIT);
  }
}
