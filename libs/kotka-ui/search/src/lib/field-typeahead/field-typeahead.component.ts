import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { DatatableColumn } from '@kotka/ui/datatable';
import { AutocompleteComponent } from '@kotka/ui/components';
import { Observable, of } from 'rxjs';
import { AutocompleteResult } from '@kotka/shared/models';
import { HighlightMatchPipe } from '../pipes/highlight-match.pipe';

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
  columns = input.required<DatatableColumn[]>();
  value = model<string>('');
  placeholder = input('Search...');

  fetchResultsFunc = this.fetchResults.bind(this);

  private fetchResults(term: string): Observable<AutocompleteResult[]> {
    term = term.trim().toLowerCase();

    const results: AutocompleteResult[] = this.columns()
      .filter(
        (column) =>
          column.field?.toLowerCase().includes(term) ||
          column.headerName?.toLowerCase().includes(term),
      )
      .map((column) => ({
        key: column.field!,
        value: column.headerName || column.field!,
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

