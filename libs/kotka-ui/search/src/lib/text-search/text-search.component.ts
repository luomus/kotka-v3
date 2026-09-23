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
  AutocompleteSuggestion,
  AutocompleteSuggestions,
  isSpecialAutocomplete,
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

type BasicTokenDataItem = {
  token: string;
  isBetween?: 'quotes' | 'regex';
}

interface RangeTokenDataItem {
  token: string;
  isBetween?: 'brackets' | 'curlyBrackets';
  childData: TokenData
}

type TokenDataItem = BasicTokenDataItem | RangeTokenDataItem;

interface TokenData {
  previous: TokenDataItem[];
  current: TokenDataItem;
  separator?: ' ' | '(' | ')';
}

interface ParsedField extends SearchField {
  type: SearchField['type'] | 'exists' | 'unknown';
}

const JOIN_OPERATOR_SUGGESTIONS: AutocompleteSuggestion[] = [
  { value: 'AND', suffix: ' ' },
  { value: 'OR', suffix: ' ' },
];

const TO_OPERATOR_SUGGESTIONS: AutocompleteSuggestion[] = [
  { value: 'TO', suffix: ' ' }
];

const SPECIAL_OPERATOR_SUGGESTIONS: AutocompleteSuggestion[] = [
  { value: '_exists_', suffix: ': "' },
];

const SUGGESTION_LIMIT = 10;

const isRangeTokenDataItem = (item: TokenDataItem): item is RangeTokenDataItem => (item.isBetween === 'brackets' || item.isBetween === 'curlyBrackets');

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
  suggestions = signal<AutocompleteSuggestions>([]);
  suggestionsLoading = signal(false);

  private fieldMap: Signal<Record<string, SearchField>>;
  private fieldFilterSuggestions: Signal<AutocompleteSuggestion[]>;
  private fieldValueSuggestions: Signal<AutocompleteSuggestion[]>;

  private fieldValueContext$ = new Subject<FieldValueContext | null>();

  constructor() {
    this.fieldMap = computed(() => this.fields().reduce((map, field) => {
      map[field.field] = field;
      return map;
    }, <Record<string, SearchField>>{}));

    this.fieldFilterSuggestions = computed<AutocompleteSuggestion[]>(() =>
      this.fields().map((field) => ({
        value: field.field,
        suffix: field.type === 'date' ? ': [' : ': "',
      })),
    );

    this.fieldValueSuggestions = computed<AutocompleteSuggestion[]>(() =>
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
        switchMap((context): Observable<AutocompleteSuggestion[] | null> => {
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
    const tokenData = this.getTokenData(textBeforeCursor);
    const current = tokenData.current;

    const currentToken = isRangeTokenDataItem(current) ? current.childData.current.token : current.token;

    this.currentToken.set(currentToken);

    const suggestions = this.getSuggestions(tokenData);

    if (suggestions === null) {
      this.suggestions.set([]);
      return;
    }

    this.fieldValueContext$.next(null);
    this.suggestions.set(this.filterAndSort(suggestions, currentToken));
  }

  private getSuggestions({ current, previous, separator }: TokenData): AutocompleteSuggestions | null {
    const parseFieldToken = (item?: TokenDataItem): ParsedField | undefined => {
      if (item?.token.endsWith(':') && !item.isBetween) {
        const fieldName = item.token.slice(0, -1);

        if (fieldName === '_exists_') {
          return { field: fieldName, type: 'exists' };
        }

        const field = this.fieldMap()[fieldName];
        return field ? field : { field: fieldName, type: 'unknown' };
      }

      return undefined;
    };

    const token = current.token;
    const lastItem = previous[previous.length - 1];

    const field = parseFieldToken(lastItem);

    if (current.isBetween === 'quotes') {
      if (field && field.type !== 'unknown') {
        if (field.type === 'exists') {
          return this.fieldValueSuggestions();
        }

        if (field.type === 'date') {
          return { type: 'datepicker', suffix: '" ' };
        }

        this.fieldValueContext$.next({ field: field.field, query: token });
        return null;
      }

      return [];
    }

    if (isRangeTokenDataItem(current)) {
      const childData = current.childData;
      const lastChildItem = childData.previous[childData.previous.length - 1];

      if (childData.previous.length === 1 && childData.separator === ' ') {
        return TO_OPERATOR_SUGGESTIONS;
      }

      if (field?.type === 'date') {
        if (childData.previous.length === 0) {
          return { type: 'datepicker', suffix: ' TO ' };
        } else if (childData.previous.length === 2 && childData.separator === ' ' && lastChildItem.token === 'TO' && !lastChildItem.isBetween) {
          return { type: 'datepicker', suffix: current.isBetween === 'brackets' ? '] ' : '} ' };
        }

        return [];
      }
    }

    if (field || current.isBetween) {
      return [];
    }

    if (
      !lastItem ||
      ((separator === ' ' || separator === '(') && ['AND', 'OR', 'NOT'].includes(lastItem.token) && !lastItem.isBetween)
    ) {
      if (token.startsWith('_')) {
        return SPECIAL_OPERATOR_SUGGESTIONS;
      }

      return token.length > 0 ? this.fieldFilterSuggestions() : [];
    }

    return separator === ' ' ? JOIN_OPERATOR_SUGGESTIONS : [];
  }

  private getTokenData(textBeforeCursor: string): TokenData {
    let token = '';
    const previousData: TokenDataItem[] = [];

    let isBetween: TokenDataItem['isBetween'] = undefined;
    let separator: TokenData['separator'] = undefined;
    let nextIsEscaped = false;

    const startCharacter: Record<string, Exclude<TokenDataItem['isBetween'], undefined>> = {
      '"': 'quotes',
      '[': 'brackets',
      '{': 'curlyBrackets',
      '/': 'regex'
    };

    const endCharacter: Record<Exclude<TokenDataItem['isBetween'], undefined>, string> = {
      quotes: '"',
      brackets: ']',
      curlyBrackets: '}',
      regex: '/',
    };

    const reset = () => {
      if (isBetween) {
        if (isBetween === 'brackets' || isBetween === 'curlyBrackets') {
          previousData.push({ token, isBetween, childData: this.getTokenData(token) });
        } else {
          previousData.push({ token, isBetween });
        }
      } else if (token) {
        previousData.push({ token });
      }

      token = '';
      isBetween = undefined;
      separator = undefined;
    };

    for (const char of textBeforeCursor) {
      if (!nextIsEscaped && !isBetween && startCharacter[char]) {
        reset();
        isBetween = startCharacter[char];
      } else if (!nextIsEscaped && isBetween && endCharacter[isBetween] === char) {
        reset();
      } else if (!nextIsEscaped && !isBetween && /[\s()]/.test(char)) {
        reset();
        separator = char === '(' ? '(' : (char === ')' ? ')' : ' ');
      } else {
        token += char;
      }

      nextIsEscaped = char === '\\' && !nextIsEscaped;
    }

    const currentData = isBetween === 'brackets' || isBetween === 'curlyBrackets' ?
      { token, isBetween, childData: this.getTokenData(token) } :
      { token, isBetween };

    return { previous: previousData, current: currentData, separator };
  }

  private filterAndSort(
    candidates: AutocompleteSuggestions,
    token: string,
  ): AutocompleteSuggestions {
    if (isSpecialAutocomplete(candidates)) {
      return candidates;
    }

    const term = token.toLowerCase();

    return candidates
      .filter((candidate) => candidate.value.toLowerCase().includes(term))
      .sort(
        (a, b) => this.scoreMatch(a, term) - this.scoreMatch(b, term),
      )
      .slice(0, SUGGESTION_LIMIT);
  }

  private scoreMatch(suggestion: AutocompleteSuggestion, term: string): number {
    return suggestion.value.toLowerCase().startsWith(term) ? 0 : 1;
  }

  private getAutocompleteValues(field: string, query: string): Observable<string[]> {
    return this.apiClient.getSearchAutocomplete(KotkaDocumentType.specimen, field, query, SUGGESTION_LIMIT);
  }
}
