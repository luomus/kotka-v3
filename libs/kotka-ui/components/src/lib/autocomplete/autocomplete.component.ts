import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { AutocompleteResult } from '@kotka/shared/models';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  OperatorFunction,
  Subject,
  switchMap,
} from 'rxjs';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { AutocompleteBaseComponent } from '../autocomplete-base/autocomplete-base';

export type { FetchAutocompleteResultsFunc } from '../autocomplete-base/autocomplete-base';

@Component({
  selector: 'kui-autocomplete',
  template: `
    <input
      class="form-control"
      type="text"
      [placeholder]="placeholder()"
      [(ngModel)]="typeaheadValue"
      [disabled]="loading()"
      [ngbTypeahead]="search"
      [inputFormatter]="inputFormatter"
      [resultFormatter]="resultFormatter"
      [resultTemplate]="resultTemplate()!"
      [container]="'body'"
      (selectItem)="onSelectItem($event)"
      (ngModelChange)="onChange()"
      (focus)="onFocus($event)"
    />
    @if (suggestionsLoading() && showSuggestionsLoadingSpinner()) {
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
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgbTypeahead],
})
export class AutocompleteComponent extends AutocompleteBaseComponent {
  typeaheadValue: string | AutocompleteResult = '';

  private focus$ = new Subject<string>();

  protected onValueChange(value?: string) {
    this.typeaheadValue = value ?? '';
  }

  onSelectItem(value: NgbTypeaheadSelectItemEvent<AutocompleteResult>) {
    this.value.set(value.item.key);
  }

  onChange() {
    if (typeof this.typeaheadValue === 'string') {
      this.value.set(this.typeaheadValue);
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
  ) =>
    merge(this.focus$, text$.pipe(debounceTime(200))).pipe(
      map((term) => term ?? ''),
      distinctUntilChanged(),
      switchMap((term) => this.fetchSuggestions(term)),
    );
}
