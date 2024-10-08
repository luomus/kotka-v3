import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
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
      [disabled]="loading"
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
export class AutocompleteComponent implements OnChanges {
  @Input() value?: string;
  @Input({ required: true }) fetchResultsFunc!: FetchAutocompleteResultsFunc;
  @Input() inputClassName = 'form-control';
  @Input() minCharacters = 1;

  loading = false;
  typeaheadValue: string|AutocompleteResult = '';

  @Output() valueChange = new EventEmitter<string|undefined>();

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value) {
      if (!this.value) {
        this.typeaheadValue = '';
      } else if (typeof this.typeaheadValue !== 'object' || this.typeaheadValue.key !== this.value) {
        this.loading = true;

        this.fetchResultsFunc(this.value).subscribe(result => {
          if (result.length < 1) {
            this.typeaheadValue = '';
            this.clearValue();
          } else {
            this.typeaheadValue = result[0];
          }

          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    }
  }

  onSelectItem(value: NgbTypeaheadSelectItemEvent<AutocompleteResult>) {
    this.value = value.item.key;
    this.valueChange.emit(this.value);
  }

  onBlur() {
    if (typeof this.typeaheadValue !== 'object') {
      this.typeaheadValue = '';
      if (this.value) {
        this.clearValue();
      }
    }
  };

  onKeyDown(event: KeyboardEvent) {
    if (event.key === KeyCode.ENTER) {
      if (this.typeaheadValue === '' && this.value) {
        this.clearValue();
      }
    }
  }

  formatter = (result: AutocompleteResult) => result.value;

  search: OperatorFunction<string, readonly AutocompleteResult[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((term) =>
        (term.length < this.minCharacters) ? of([]) : this.fetchResultsFunc(term)
      ),
    );

  private clearValue() {
    this.value = undefined;
    this.valueChange.emit(this.value);
  }
}
