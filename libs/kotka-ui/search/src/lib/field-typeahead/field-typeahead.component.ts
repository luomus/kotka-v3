import {
  ChangeDetectionStrategy,
  Component, computed,
  input,
  model, Signal,
} from '@angular/core';
import { AutocompleteComponent } from '@kotka/ui/components';
import { Observable, of } from 'rxjs';
import { AutocompleteResult, SearchField } from '@kotka/shared/models';
import { HighlightMatchPipe } from '@kotka/ui/core';
import { MultiSearchField } from '../models';

interface FieldTypeaheadOption extends AutocompleteResult {
  hideKey?: boolean;
}

@Component({
  selector: 'kui-field-typeahead',
  template: `
    <kui-autocomplete
      [value]="value()"
      [placeholder]="placeholder()"
      [minCharacters]="0"
      [resultTemplate]="resultTemplate"
      [fetchResultsFunc]="fetchResultsFunc"
      [showSuggestionsLoadingSpinner]="false"
      (valueChange)="value.set($event || '')"
    ></kui-autocomplete>
    <ng-template #resultTemplate let-option="result" let-term="term">
      <span>
        <span [innerHTML]="option.value | highlightMatch: term"></span>
        @if (!option.hideKey) {
          <small class="text-muted">
            (<span [innerHTML]="option.key | highlightMatch: term"></span>)
          </small>
        }
      </span>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AutocompleteComponent, HighlightMatchPipe],
})
export class FieldTypeaheadComponent {
  fields = input.required<SearchField[]>();
  multiFields = input<MultiSearchField[]>([]);
  value = model<string>('');
  placeholder = input('Search...');

  options: Signal<FieldTypeaheadOption[]>;

  fetchResultsFunc = this.fetchResults.bind(this);

  constructor() {
    this.options = computed(() => (
      [
        ...this.multiFields().map((multiField) => ({
          key: multiField.field,
          value: multiField.label || multiField.field,
          hideKey: true,
        })),
        ...this.fields().map((field) => ({
          key: field.field,
          value: field.label || field.field,
        })),
      ]
    ));
  }

  private fetchResults(term: string): Observable<FieldTypeaheadOption[]> {
    term = term.trim().toLowerCase();

    const results = this.options()
      .filter(
        (option) =>
          option.value.toLowerCase().includes(term)
          || option.key.toLowerCase().includes(term)
      )
      .sort((a, b) => this.scoreMatch(a, term) - this.scoreMatch(b, term));

    return of(results);
  }

  private scoreMatch(result: FieldTypeaheadOption, term: string): number {
    const label = result.value.toLowerCase();
    const key = result.key.toLowerCase();

    if (label.startsWith(term)) {
      return 0;
    }
    if (key.startsWith(term)) {
      return 1;
    }
    if (label.includes(term)) {
      return 2;
    }
    return 3;
  }
}

