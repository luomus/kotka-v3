import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgbHighlight,
  NgbTypeahead,
  NgbTypeaheadSelectItemEvent,
} from '@ng-bootstrap/ng-bootstrap';
import { AutocompleteResult } from '@kotka/shared/models';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  of,
  OperatorFunction,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { AutocompleteBaseComponent } from '../autocomplete-base/autocomplete-base';

interface SelectMessage {
  message: string;
}

type SelectOption = AutocompleteResult | SelectMessage;

const isMessage = (option: SelectOption): option is SelectMessage =>
  'message' in option;

@Component({
  selector: 'kui-select',
  template: `
    @let hasSpinner = suggestionsLoading() && showSuggestionsLoadingSpinner();
    @let hasClear = inputText() || selected();
    <input
      type="text"
      [class]="inputClassName()"
      [class.has-selection]="focused() && selected()"
      [class.has-clear]="hasClear"
      [class.has-spinner]="hasSpinner"
      [placeholder]="inputPlaceholder()"
      [ngModel]="inputText()"
      [disabled]="loading()"
      [ngbTypeahead]="search"
      [resultTemplate]="optionTemplate"
      [container]="'body'"
      popupClass="kui-select-popup"
      (ngModelChange)="searchText.set($event ?? '')"
      (selectItem)="onSelectItem($event)"
      (focus)="onFocus()"
      (mousedown)="onMouseDown()"
      (blur)="onBlur()"
      (keydown.backspace)="onBackspace()"
    />
    <ng-template #optionTemplate let-option="result">
      @let term = searchText() || this.selected()?.value || '';
      @if (isMessage(option)) {
        <span class="non-selectable-option">{{ option.message }}</span>
      } @else if (resultTemplate(); as template) {
        <ng-container
          *ngTemplateOutlet="template; context: { result: option, term: term }"
        ></ng-container>
      } @else {
        <ngb-highlight [result]="option.value" [term]="term"></ngb-highlight>
      }
    </ng-template>
    @if (hasClear) {
      <button
        type="button"
        class="btn-close clear-all-btn"
        aria-label="Clear all"
        [disabled]="loading()"
        (mousedown)="$event.preventDefault()"
        (click)="clearAll()"
      ></button>
    }
    @if (hasSpinner) {
      <div class="suggestions-loading" [class.has-clear]="hasClear">
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
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgbTypeahead, NgbHighlight, NgTemplateOutlet],
})
export class SelectComponent extends AutocompleteBaseComponent {
  private typeahead = viewChild.required(NgbTypeahead);

  inputClassName = input('form-control');
  typeToSearchText = input('Type to search...');
  notFoundText = input('No results found');

  selected = signal<AutocompleteResult | null>(null);
  focused = signal(false);
  searchText = signal('');

  inputText = computed(() =>
    this.focused() ? this.searchText() : (this.selected()?.value ?? ''),
  );
  inputPlaceholder = computed(
    () => (this.focused() && this.selected()?.value) || this.placeholder(),
  );

  private open$ = new Subject<void>();
  private fetchValueSub?: Subscription;

  protected isMessage = isMessage;

  search: OperatorFunction<string, readonly SelectOption[]> = (
    text$: Observable<string>,
  ) =>
    merge(this.open$.pipe(), text$.pipe(debounceTime(200))).pipe(
      map((term) => term ?? ''),
      distinctUntilChanged(),
      switchMap((term): Observable<SelectOption[]> => {
        if (term.length < this.minCharacters()) {
          return of([{ message: this.typeToSearchText() }]);
        }
        return this.fetchSuggestions(term).pipe(
          map((results) =>
            results.length ? results : [{ message: this.notFoundText() }],
          )
        );
      }),
    );

  onSelectItem(event: NgbTypeaheadSelectItemEvent<SelectOption>) {
    event.preventDefault();

    if (isMessage(event.item)) {
      return;
    }

    this.searchText.set('');
    this.selected.set(event.item);
    this.value.set(event.item.key);
  }

  onFocus() {
    this.searchText.set('');
    this.focused.set(true);
    this.open$.next();
  }

  onMouseDown() {
    if (this.focused() && !this.typeahead().isPopupOpen()) {
      this.open$.next();
    }
  }

  onBlur() {
    this.focused.set(false);
    this.searchText.set('');
  }

  onBackspace() {
    if (this.searchText() === '' && this.selected()) {
      this.clearAll();
    }
  }

  clearAll() {
    this.searchText.set('');
    this.selected.set(null);
    this.value.set(undefined);
  }

  protected onValueChange(value?: string) {
    this.fetchValueSub?.unsubscribe();

    if (this.selected()?.key === value) {
      return;
    }

    if (value === undefined) {
      this.selected.set(null);
      return;
    }

    this.fetchValueSub = this.getSuggestionFromKey(value).subscribe((match) => {
      this.selected.set(match ?? { key: value, value });
    });
  }
}
