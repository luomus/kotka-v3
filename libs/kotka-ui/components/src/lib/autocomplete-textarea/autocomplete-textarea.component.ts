import {
  ChangeDetectionStrategy,
  Component,
  computed, DOCUMENT, effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WINDOW, HighlightMatchPipe, padDayOrMonth } from '@kotka/ui/core';
import { NgbDate, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';

export interface AutocompleteSuggestion {
  value: string;
  suffix?: string;
}

export interface SpecialAutocomplete {
  type: 'datepicker';
  suffix?: string;
}

export type AutocompleteSuggestions = AutocompleteSuggestion[] | SpecialAutocomplete;

export const isSpecialAutocomplete = (suggestions: AutocompleteSuggestion[] | SpecialAutocomplete): suggestions is SpecialAutocomplete => {
  return 'type' in suggestions;
};

@Component({
  selector: 'kui-autocomplete-textarea',
  imports: [FormsModule, HighlightMatchPipe, NgbDatepicker],
  templateUrl: './autocomplete-textarea.component.html',
  styleUrl: './autocomplete-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteTextareaComponent {
  private window = inject(WINDOW);
  private document = inject(DOCUMENT);

  text = model<string>('');

  suggestions = input<AutocompleteSuggestions>([]);
  token = input<string>('');
  loading = input<boolean>(false);

  contextChange = output<string>();

  showSuggestions = signal(false);
  activeSuggestionIndex = signal(0);
  fixedDropdownPosition = signal<{ top: number; left: number }>({ top: 0, left: 0});

  isSpecialAutocomplete = isSpecialAutocomplete;

  private textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');
  private mirrorRef = viewChild<ElementRef<HTMLDivElement>>('mirror');
  private datepickerRef = viewChild<NgbDatepicker, ElementRef<HTMLElement>>('datepicker', { read: ElementRef });
  private dropdownRef = viewChild<ElementRef<HTMLDivElement>>('dropdown');

  private cursorPosition = signal(0);
  private dropdownTargetPosition: Signal<number>;
  private dropdownPosition: Signal<{ top: number; left: number }>;

  private textBeforeCursor = signal('');

  constructor() {
    this.dropdownTargetPosition = computed(() => this.cursorPosition() - this.token().length);

    this.dropdownPosition = computed(() =>
      this.getDropdownPosition(
        this.mirrorRef()?.nativeElement,
        this.textareaRef()?.nativeElement,
        this.dropdownTargetPosition()
      ),
    );

    effect(() => {
      let fixedPosition = this.dropdownPosition();

      setTimeout(() => {
        const elem = this.datepickerRef()?.nativeElement || this.dropdownRef()?.nativeElement;
        const textareaLeft = this.textareaRef()?.nativeElement.getBoundingClientRect().left;

        if (elem && textareaLeft !== undefined) {
          const width = elem.getBoundingClientRect().width;

          const maxLeft = this.document.documentElement.clientWidth - textareaLeft - width;
          fixedPosition = { ...fixedPosition, left: Math.min(fixedPosition.left, maxLeft) };
        }

        this.fixedDropdownPosition.set(fixedPosition);
      });
    });

    effect(() => {
      this.suggestions();
      this.activeSuggestionIndex.set(0);
    });

    effect(() => {
      this.contextChange.emit(this.textBeforeCursor());
    });
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.hideSuggestions();
      return;
    }

    const suggestions = this.suggestions();

    if (this.isSpecialAutocomplete(suggestions)) {
      return;
    }

    if (suggestions.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(suggestions, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(suggestions, -1);
        break;
      case 'Enter':
      case 'Tab': {
        const suggestion = suggestions[this.activeSuggestionIndex()];
        if (suggestion) {
          event.preventDefault();
          this.applySuggestion(suggestion);
        }
        break;
      }
    }
  }

  onKeyup(event: KeyboardEvent) {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      this.updateSuggestions();
    }
  }

  updateSuggestions() {
    const textarea = this.textareaRef()?.nativeElement;
    if (!textarea) {
      return;
    }

    this.showSuggestions.set(true);
    this.cursorPosition.set(textarea.selectionStart);
    this.textBeforeCursor.set(textarea.value.slice(0, this.cursorPosition()));
  }

  hideSuggestions() {
    this.showSuggestions.set(false);
  }

  applyDateSuggestion(date: NgbDate, suffix?: string) {
    const formattedDate = `${date.year}-${padDayOrMonth(date.month)}-${padDayOrMonth(date.day)}`;
    this.applySuggestion({ value: formattedDate, suffix });
  }

  applySuggestion(suggestion: AutocompleteSuggestion) {
    const textarea = this.textareaRef()?.nativeElement;
    if (!textarea) {
      return;
    }

    const cursor = textarea.selectionStart;
    const value = textarea.value;
    const tokenStart = cursor - this.token().length;
    const insert = suggestion.value + (suggestion.suffix || '');
    const newText = value.slice(0, tokenStart) + insert + value.slice(cursor);
    const newCursor = tokenStart + insert.length;

    this.text.set(newText);
    this.hideSuggestions();

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
      this.updateSuggestions();
    });
  }

  private moveActive(suggestions: AutocompleteSuggestion[], delta: number) {
    const count = suggestions.length;
    const newIndex = Math.min(Math.max(this.activeSuggestionIndex() + delta, 0), count - 1);
    this.activeSuggestionIndex.set(newIndex);
  }

  private getDropdownPosition(
    mirror: HTMLDivElement | undefined,
    textarea: HTMLTextAreaElement | undefined,
    position: number,
  ) {
    if (!mirror || !textarea) {
      return { top: 0, left: 0 };
    }

    const coordinates = this.getCursorCoordinates(mirror, textarea, position);

    return {
      top: coordinates.top + coordinates.lineHeight - textarea.scrollTop,
      left: coordinates.left - textarea.scrollLeft,
    };
  }

  private getCursorCoordinates(
    mirror: HTMLElement,
    textarea: HTMLTextAreaElement,
    position: number,
  ): { top: number; left: number; lineHeight: number } {
    const textChild = mirror.children.item(0);
    const markerChild = mirror.children.item(1);

    if (!(textChild instanceof HTMLElement) || !(markerChild instanceof HTMLElement)) {
      throw new Error('Textarea mirror element children are missing.');
    }

    textChild.textContent = textarea.value.slice(0, position);

    const top = markerChild.offsetTop;
    const left = markerChild.offsetLeft;
    const lineHeight = parseFloat(this.window.getComputedStyle(mirror).getPropertyValue('line-height'));

    return { top, left, lineHeight };
  }
}

