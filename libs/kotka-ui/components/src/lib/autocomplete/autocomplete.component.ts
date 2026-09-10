import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  TemplateRef,
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
      [placeholder]="placeholder"
      [className]="inputClassName"
      [(ngModel)]="typeaheadValue"
      [disabled]="loading"
      [ngbTypeahead]="search"
      [inputFormatter]="formatter"
      [resultFormatter]="formatter"
      [resultTemplate]="resultTemplate!"
      [container]="'body'"
      (selectItem)="onSelectItem($event)"
      (blur)="onBlur()"
      (ngModelChange)="onChange()"
      (focus)="onFocus($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgbTypeahead],
})
export class AutocompleteComponent implements OnChanges {
  private cdr = inject(ChangeDetectorRef);

  @Input() value?: string;
  @Input({ required: true }) fetchResultsFunc!: FetchAutocompleteResultsFunc;
  @Input() placeholder = 'Search...';
  @Input() inputClassName = 'form-control';
  @Input() minCharacters = 1;
  @Input() resultTemplate?: TemplateRef<any>;

  loading = false;
  typeaheadValue: string | AutocompleteResult = '';

  @Output() valueChange = new EventEmitter<string | undefined>();

  private focus$ = new Subject<string>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      if (!this.value) {
        this.typeaheadValue = '';
      } else if (
        typeof this.typeaheadValue !== 'object' ||
        this.typeaheadValue.key !== this.value
      ) {
        this.loading = true;

        this.fetchResultsFunc(this.value).subscribe((result) => {
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
  }

  onChange() {
    if (this.typeaheadValue === '' && this.value) {
      this.clearValue();
    }
  }

  onFocus(event: FocusEvent) {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.focus$.next(target.value);
    }
  }

  formatter = (result: AutocompleteResult) => result.value;

  search: OperatorFunction<string, readonly AutocompleteResult[]> = (
    text$: Observable<string>,
  ) => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    return merge(debouncedText$, this.focus$).pipe(
      switchMap((term) =>
        term.length < this.minCharacters ? of([]) : this.fetchResultsFunc(term),
      ),
    );
  };

  private clearValue() {
    this.value = undefined;
    this.valueChange.emit(this.value);
  }
}
