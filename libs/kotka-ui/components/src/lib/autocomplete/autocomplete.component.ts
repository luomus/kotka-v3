import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  TemplateRef,
  signal,
  input,
  effect,
  model,
} from '@angular/core';
import { AutocompleteResult } from '@kotka/shared/models';
import {
  debounceTime,
  distinctUntilChanged,
  merge,
  Observable,
  of,
  OperatorFunction,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

export type FetchAutocompleteResultsFunc = (
  term: string,
) => Observable<AutocompleteResult[]>;

@Component({
  selector: 'kui-autocomplete',
  template: `
    <input
      type="text"
      [placeholder]="placeholder()"
      [className]="inputClassName()"
      [(ngModel)]="typeaheadValue"
      [disabled]="loading"
      [ngbTypeahead]="search"
      [inputFormatter]="inputFormatter"
      [resultFormatter]="resultFormatter"
      [resultTemplate]="resultTemplate()!"
      [container]="'body'"
      (selectItem)="onSelectItem($event)"
      (blur)="onBlur()"
      (ngModelChange)="onChange()"
      (focus)="onFocus($event)"
    />
    @if (suggestionsLoading() && showSuggestionsLoadingSpinner()){
      <div class="suggestions-loading">
        <span
          class="spinner-border spinner-border-sm text-secondary"
          role="status"
          aria-live="polite"
        >
          <span class="visually-hidden">Loading suggestions...</span>
        </span>
      </div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: block;
    }
    .suggestions-loading {
      position: absolute;
      top: 0.35rem;
      right: 0.6rem;
      pointer-events: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgbTypeahead],
})
export class AutocompleteComponent {
  private cdr = inject(ChangeDetectorRef);

  value = model<string>();
  fetchResultsFunc = input.required<FetchAutocompleteResultsFunc>();
  placeholder = input('Search...');
  inputClassName = input('form-control');
  minCharacters = input(1);
  resultTemplate = input<TemplateRef<any>>();
  allowFreeText = input(false);
  showSuggestionsLoadingSpinner = input(true);

  loading = false;
  suggestionsLoading = signal(false);
  typeaheadValue: string | AutocompleteResult = '';

  private focus$ = new Subject<string>();

  constructor() {
    effect(() => {
      const value = this.value();

      if (this.allowFreeText()) {
        this.typeaheadValue = value ?? '';
      } else if (!value) {
        this.typeaheadValue = '';
      } else if (
        typeof this.typeaheadValue !== 'object' ||
        this.typeaheadValue.key !== value
      ) {
        this.loading = true;

        this.fetchResultsFunc()(value).subscribe((result) => {
          if (result.length < 1) {
            this.typeaheadValue = '';
            this.value.set(undefined);
          } else {
            this.typeaheadValue = result[0];
          }

          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  onSelectItem(value: NgbTypeaheadSelectItemEvent<AutocompleteResult>) {
    this.value.set(value.item.key);
  }

  onBlur() {
    if (this.allowFreeText()) {
      return;
    }

    if (typeof this.typeaheadValue !== 'object') {
      this.typeaheadValue = '';
      this.value.set(undefined);
    }
  }

  onChange() {
    if (this.allowFreeText()) {
      if (typeof this.typeaheadValue === 'string') {
        this.value.set(this.typeaheadValue);
      }
      return;
    }

    if (this.typeaheadValue === '') {
      this.value.set(undefined);
    }
  }

  onFocus(event: FocusEvent) {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.focus$.next(target.value);
    }
  }

  inputFormatter = (result: AutocompleteResult | string) =>
    typeof result === 'string' ? result : result.value;
  resultFormatter = (result: AutocompleteResult) => result.value;

  search: OperatorFunction<string, readonly AutocompleteResult[]> = (
    text$: Observable<string>,
  ) => {
    const debouncedText$ = text$.pipe(
      tap((term) => (this.suggestionsLoading.set(term.length >= this.minCharacters()))),
      debounceTime(200),
      distinctUntilChanged(),
    );
    return merge(debouncedText$, this.focus$).pipe(
      tap((term) => this.suggestionsLoading.set(term.length >= this.minCharacters())),
      switchMap((term) =>
        term.length < this.minCharacters() ? of([]) : this.fetchResultsFunc()(term),
      ),
      tap(() => this.suggestionsLoading.set(false)),
    );
  };
}
