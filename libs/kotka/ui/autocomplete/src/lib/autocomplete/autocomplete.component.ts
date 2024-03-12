import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { KeyCode } from '@ag-grid-community/core';
import { AutocompleteResult } from '@kotka/api-interfaces';
import { debounceTime, distinctUntilChanged, Observable, of, OperatorFunction, switchMap } from 'rxjs';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

export type FetchAutocompleteResultsFunc = (term: string) => Observable<AutocompleteResult[]>;

@Component({
  selector: 'kui-autocomplete',
  template: `
    <input
      type="text"
      placeholder="Search..."
      [className]="inputClassName"
      [(ngModel)]="typeaheadValue"
      [ngbTypeahead]="search"
      [inputFormatter]="formatter"
      [resultFormatter]="formatter"
      [container]="'body'"
      (selectItem)="onSelectItem($event)"
      (blur)="onBlur()"
      (keydown)="onKeyDown($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent {
  @Input() value?: string;
  @Input() fetchResultsFunc?: FetchAutocompleteResultsFunc;
  @Input() inputClassName = 'form-control';

  typeaheadValue: string|AutocompleteResult = '';

  @Output() valueChange = new EventEmitter<string>();

  onSelectItem(value: NgbTypeaheadSelectItemEvent<AutocompleteResult>) {
    this.valueChange.emit(value.item.key);
  }

  onBlur() {
    if (typeof this.typeaheadValue !== 'object') {
      this.typeaheadValue = '';
      if (this.value) {
        this.valueChange.emit();
      }
    }
  };

  onKeyDown(event: KeyboardEvent) {
    if (event.key === KeyCode.ENTER) {
      if (this.typeaheadValue === '' && this.value) {
        this.valueChange.emit();
      }
    }
  }

  formatter = (result: AutocompleteResult) => result.value;

  search: OperatorFunction<string, readonly AutocompleteResult[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((term) =>
        (term.length < 2 || !this.fetchResultsFunc) ? of([]) : this.fetchResultsFunc(term)
      ),
    );
}
