import {
  ChangeDetectionStrategy,
  Component, computed,
  effect,
  HostListener,
  Inject,
  input,
  output, signal, Signal
} from '@angular/core';
import {
  LajiFormFieldChooserHighlightComponent,
} from './laji-form-field-chooser-highlight.component';
import { DOCUMENT } from '@angular/common';

interface HighlightDimensions {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface HighlightData extends HighlightDimensions {
  id: string;
  field: string;
  selected: boolean;
  schemaElem: HTMLElement;
}

export const getFieldJsonPointerFromId = (schemaElemId: string): string => {
  return schemaElemId
    .replace(/_laji-form_root|_[0-9]/g, '')
    .replace(/_/g, '/');
};

const getHighlightElemIdFromSchemaElemId = (schemaElemId: string): string => {
  return schemaElemId.replace('_laji-form_root', '_laji-form_field_chooser');
};

@Component({
  selector: 'kui-laji-form-field-chooser',
  template: `
    @for (highlight of highlights(); track highlight.id; let idx = $index) {
      <kui-laji-form-field-chooser-highlight
        [id]="highlight.id"
        [top]="highlight.top"
        [left]="highlight.left"
        [width]="highlight.width"
        [height]="highlight.height"
        [selected]="highlightSelectedByIdx()[idx]"
        (selectedChange)="setSelected(highlight.field, $event)"
      ></kui-laji-form-field-chooser-highlight>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LajiFormFieldChooserHighlightComponent],
})
export class LajiFormFieldChooserComponent {
  selectedFields = input<string[]>([]);
  ignoreFields = input<string[]>([]);

  highlights = signal<HighlightData[]>([]);
  highlightSelectedByIdx: Signal<Record<number, boolean>>;

  selectedFieldsChange = output<string[]>();

  private highlightIndexesByField: Signal<Record<string, number[]>>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject('Window') private window: Window
  ) {
    effect(() => {
      this.highlights.set(this.getHighlights(this.ignoreFields()));
    });

    this.highlightIndexesByField = computed(() => {
      const result: Record<string, number[]> = {};
      this.highlights().forEach((highlight, idx) => {
        if (!result[highlight.field]) {
          result[highlight.field] = [];
        }
        result[highlight.field].push(idx);
      });
      return result;
    });

    this.highlightSelectedByIdx = computed(() => {
      const result: Record<number, boolean> = {};
      this.selectedFields().forEach(field => {
        this.highlightIndexesByField()[field].forEach(idx => {
          result[idx] = true;
        });
      });
      return result;
    });
  }

  @HostListener('window:resize', [])
  onResize() {
    this.highlights.update(highlightData => (
      highlightData.map(data => ({ ...data, ...this.getDimensions(data.schemaElem) })))
    );
  }

  setSelected(field: string, selected: boolean) {
    const newSelected: string[] = this.selectedFields().filter(f => f !== field);
    if (selected) {
      newSelected.push(field);
    }
    this.selectedFieldsChange.emit(newSelected);
  }

  private getHighlights(ignoreFields: string[]) {
    const highlights: HighlightData[] = [];

    const schemaElems = Array.from<HTMLElement>(
      this.document.querySelectorAll('[id^=_laji-form_root_]'),
    );

    schemaElems.forEach((schemaElem: HTMLElement) => {
      if (schemaElem.id?.match(/^(.*)_\d$/)) {
        return;
      }

      const field = getFieldJsonPointerFromId(schemaElem.id);

      if (ignoreFields.includes(field)) {
        return;
      }

      highlights.push({
        id: getHighlightElemIdFromSchemaElemId(schemaElem.id),
        field: field,
        ...this.getDimensions(schemaElem),
        schemaElem,
        selected: false
      });
    });

    return highlights;
  }

  private getDimensions(schemaElem: HTMLElement): HighlightDimensions {
    const { top, width, left, height } = schemaElem.getBoundingClientRect();
    const scrolled = this.window.scrollY;

    return { top: top + scrolled, width, left, height };
  }
}
