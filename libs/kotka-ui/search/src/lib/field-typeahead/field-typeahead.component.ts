import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { AutocompleteComponent } from '@kotka/ui/components';
import { Observable, of } from 'rxjs';
import { AutocompleteResult, SearchField } from '@kotka/shared/models';
import { HighlightMatchPipe } from '@kotka/ui/core';

@Component({
  selector: 'kui-field-typeahead',
  template: `
    <kui-autocomplete
      [(value)]="value"
      [placeholder]="placeholder()"
      [minCharacters]="0"
      [resultTemplate]="resultTemplate"
      [fetchResultsFunc]="fetchResultsFunc"
    ></kui-autocomplete>
    <ng-template #resultTemplate let-option="result" let-term="term">
      <span>
        <span [innerHTML]="option.value | highlightMatch: term"></span>
        <small class="text-muted">
          (<span [innerHTML]="option.key | highlightMatch: term"></span>)
        </small>
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
  value = model<string>('');
  placeholder = input('Search...');

  fetchResultsFunc = this.fetchResults.bind(this);

  private fetchResults(term: string): Observable<AutocompleteResult[]> {
    term = term.trim().toLowerCase();

    const results: AutocompleteResult[] = this.fields()
      .filter(
        (field) =>
          field.field?.toLowerCase().includes(term)
          // || field.label?.toLowerCase().includes(term), TODO when label exists
      )
      .map((field) => ({
        key: field.field,
        value: field.field,
      }))
      .sort((a, b) => this.scoreMatch(a, term) - this.scoreMatch(b, term));

    return of(results);
  }

  private scoreMatch(result: AutocompleteResult, term: string): number {
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

