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
  FieldChooserColorTheme,
  LajiFormFieldChooserHighlightComponent
} from './laji-form-field-chooser-highlight.component';
import { DOCUMENT } from '@angular/common';
import { DialogService } from '@kotka/ui/services';

export type FieldChooserMode = 'fieldSelect'|'jsonPointerSelect';

interface HighlightDimensions {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface HighlightData extends HighlightDimensions {
  id: string;
  field: string;
  jsonPointer: string;
  selected: boolean;
  schemaElem: HTMLElement;
}

const getJsonPointerFromId = (schemaElemId: string): string => {
  return schemaElemId
    .replace(/_laji-form_root/g, '')
    .replace(/_/g, '/');
};

const getFieldFromJsonPointer = (jsonPointer: string): string => {
  return jsonPointer
    .replace(/\/[0-9]/g, '');
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
        [label]="highlight.field"
        [colorTheme]="colorTheme()"
        [selected]="highlightSelectedByIdx()[idx]"
        (selectedChange)="setSelected(highlight, $event)"
      ></kui-laji-form-field-chooser-highlight>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LajiFormFieldChooserHighlightComponent],
})
export class LajiFormFieldChooserComponent {
  mode = input<FieldChooserMode>('fieldSelect');

  selected = input<string[]>([]); // if the mode is fieldSelect this should be a list of fields (i.e. ["/gatherings/dateBegin"]), and if the mode is jsonPointerSelect this should be a list of jsonPointers (i.e. ["/gatherings/0/dateBegin"])

  ignoreFields = input<string[]>([]);
  unselectableFields = input<string[]>([]);
  unselectableFieldsErrorMsg = input<string|undefined>(undefined);

  colorTheme = input<FieldChooserColorTheme>('red');

  highlights = signal<HighlightData[]>([]);
  highlightSelectedByIdx: Signal<Record<number, boolean>>;

  selectedChange = output<string[]>();

  private highlightIndexesBySelectedProp: Signal<Record<string, number[]>>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject('Window') private window: Window,
    private dialogService: DialogService
  ) {
    effect(() => {
      this.highlights.set(this.getHighlights(this.ignoreFields()));
    });

    this.highlightIndexesBySelectedProp = computed(() => {
      const result: Record<string, number[]> = {};

      const prop = this.mode() === 'fieldSelect' ? 'field' : 'jsonPointer';

      this.highlights().forEach((highlight, idx) => {
        if (!result[highlight[prop]]) {
          result[highlight[prop]] = [];
        }
        result[highlight[prop]].push(idx);
      });

      return result;
    });

    this.highlightSelectedByIdx = computed(() => {
      const result: Record<number, boolean> = {};

      this.selected().forEach(fieldOrJsonPointer => {
        this.highlightIndexesBySelectedProp()[fieldOrJsonPointer]?.forEach(idx => {
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

  setSelected(highlight: HighlightData, selected: boolean) {
    const { field, jsonPointer } = highlight;

    if (selected && this.unselectableFields().includes(field)) {
      this.dialogService.alert(this.unselectableFieldsErrorMsg() || 'Field can\'t be selected');
      return;
    }

    let newSelected: string[];

    if (this.mode() === 'fieldSelect') {
      newSelected = this.selected().filter(val => val !== field);
      if (selected) {
        newSelected.push(field);
      }
    } else {
      newSelected = this.selected().filter(val => val !== jsonPointer);
      if (selected) {
        newSelected.push(jsonPointer);
      }
    }

    this.selectedChange.emit(newSelected);
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

      const jsonPointer = getJsonPointerFromId(schemaElem.id);
      const field = getFieldFromJsonPointer(jsonPointer);

      if (ignoreFields.includes(field)) {
        return;
      }

      highlights.push({
        id: getHighlightElemIdFromSchemaElemId(schemaElem.id),
        field,
        jsonPointer,
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
