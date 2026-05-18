import { ChangeDetectionStrategy, Component, computed, effect, HostListener, input, OnDestroy, output, signal, Signal, DOCUMENT, inject } from '@angular/core';
import {
  FieldChooserColorTheme,
  LajiFormFieldChooserHighlightComponent
} from './laji-form-field-chooser-highlight.component';

import { DialogService } from '@kotka/ui/core';
import { LajiForm } from '@kotka/shared/models';
import { parseSchemaFromFormDataPointer } from '@luomus/laji-form/lib/utils';

export const LAJI_FORM_ROOT_ID = '_laji-form_root';

export type FieldChooserMode = 'fieldSelect'|'jsonPointerSelect';

export type FieldChooserIgnoreFieldType = 'objectArray'|'objectArrayItem'|'array'|'arrayItem'|'object';

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
    .replace(new RegExp(LAJI_FORM_ROOT_ID, 'g'), '')
    .replace(/_/g, '/');
};

const getFieldFromJsonPointer = (jsonPointer: string): string => {
  return jsonPointer
    .replace(/\/[0-9]/g, '');
};

const getHighlightElemIdFromSchemaElemId = (schemaElemId: string): string => {
  return schemaElemId.replace(LAJI_FORM_ROOT_ID, '_laji-form_field_chooser');
};

const selector = 'kui-laji-form-field-chooser';

@Component({
  selector,
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
export class LajiFormFieldChooserComponent implements OnDestroy {
  private document = inject<Document>(DOCUMENT);
  private dialogService = inject(DialogService);

  form = input<LajiForm.SchemaForm | undefined>(undefined);
  formContainerElem = input<HTMLElement | undefined>(undefined);

  mode = input<FieldChooserMode>('fieldSelect');
  selected = input<string[]>([]); // if the mode is fieldSelect this should be a list of fields (i.e. ["/gatherings/dateBegin"]), and if the mode is jsonPointerSelect this should be a list of jsonPointers (i.e. ["/gatherings/0/dateBegin"])

  ignoreFieldsOfType = input<FieldChooserIgnoreFieldType[]>([]);
  unselectableFields = input<string[]>([]);
  unselectableFieldsErrorMsg = input<string | undefined>(undefined);

  colorTheme = input<FieldChooserColorTheme>('red');

  highlights = signal<HighlightData[]>([]);
  highlightSelectedByIdx: Signal<Record<number, boolean>>;

  selectedChange = output<string[]>();

  private highlightIndexesBySelectedProp: Signal<Record<string, number[]>>;

  private formMutationObserver: MutationObserver;
  private formContainerMutationObserver: MutationObserver;
  private resizeObserver: ResizeObserver;

  private resizeRafId: number | null = null;

  constructor() {
    // if form structure changes, recreate highlights
    this.formMutationObserver = new MutationObserver(() => {
      if (!this.form()) {
        return;
      }

      this.highlights.set(
        this.getHighlights(
          this.form()!,
          this.mode(),
          this.ignoreFieldsOfType(),
        ),
      );
    });

    // if new children are added to container, observe them with ResizeObserver in case they affect layout
    this.formContainerMutationObserver = new MutationObserver(
      (mutationList) => {
        for (const mutation of mutationList) {
          if (
            mutation.target === this.formContainerElem() &&
            mutation.type === 'childList'
          ) {
            Array.from(mutation.addedNodes).forEach((child) => {
              if (child instanceof HTMLElement) {
                this.resizeObserver.observe(child);
              }
            });
          }
        }

        this.scheduleResizeUpdate();
      },
    );

    this.resizeObserver = new ResizeObserver(() => {
      this.scheduleResizeUpdate();
    });

    effect(() => {
      this.formMutationObserver.disconnect();
      this.formContainerMutationObserver.disconnect();
      this.resizeObserver.disconnect();

      const formContainer = this.formContainerElem();
      if (!formContainer) {
        return;
      }

      Array.from(formContainer.children).forEach((child) => {
        if (child.nodeName.toLowerCase() === selector) {
          return;
        }

        if (child.id === LAJI_FORM_ROOT_ID) {
          this.formMutationObserver.observe(child, {
            childList: true,
            subtree: true,
          });
        }

        this.resizeObserver.observe(child);
      });

      this.formContainerMutationObserver.observe(formContainer, {
        childList: true,
      });
    });

    effect(() => {
      if (!this.form()) {
        return;
      }

      this.highlights.set(
        this.getHighlights(
          this.form()!,
          this.mode(),
          this.ignoreFieldsOfType(),
        ),
      );
    });

    this.highlightIndexesBySelectedProp = computed(() =>
      this.getHighlightIndexesBySelectedProp(
        this.highlights(),
        this.mode() === 'fieldSelect' ? 'field' : 'jsonPointer',
      ),
    );

    this.highlightSelectedByIdx = computed(() =>
      this.getHighlightSelectedByIdx(
        this.selected(),
        this.highlightIndexesBySelectedProp(),
      ),
    );
  }

  ngOnDestroy() {
    this.formMutationObserver.disconnect();
    this.formContainerMutationObserver.disconnect();
    this.resizeObserver.disconnect();

    if (this.resizeRafId !== null) {
      cancelAnimationFrame(this.resizeRafId);
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    this.scheduleResizeUpdate();
  }

  setSelected(highlight: HighlightData, selected: boolean) {
    const { field, jsonPointer } = highlight;

    if (selected && this.unselectableFields().includes(field)) {
      this.dialogService.alert(
        this.unselectableFieldsErrorMsg() || 'Field can\'t be selected',
      );
      return;
    }

    let newSelected: string[];

    if (this.mode() === 'fieldSelect') {
      newSelected = this.selected().filter((val) => val !== field);
      if (selected) {
        newSelected.push(field);
      }
    } else {
      newSelected = this.selected().filter((val) => val !== jsonPointer);
      if (selected) {
        newSelected.push(jsonPointer);
      }
    }

    this.selectedChange.emit(newSelected);
  }

  private updateDimensions() {
    this.highlights.update((highlightData) =>
      highlightData.map((data) => ({
        ...data,
        ...this.getDimensions(data.schemaElem),
      })),
    );
  }

  private getHighlights(
    form: LajiForm.SchemaForm,
    mode: FieldChooserMode,
    ignore: FieldChooserIgnoreFieldType[],
  ): HighlightData[] {
    const highlights: HighlightData[] = [];

    if (mode === 'fieldSelect') {
      ignore = [...ignore, 'arrayItem'];
    }

    const schemaElems = Array.from<HTMLElement>(
      this.document.querySelectorAll(`[id^=${LAJI_FORM_ROOT_ID}_]`),
    );

    schemaElems.forEach((schemaElem: HTMLElement) => {
      const jsonPointer = getJsonPointerFromId(schemaElem.id);
      const schema = parseSchemaFromFormDataPointer(form.schema, jsonPointer);
      const isArrayItem = jsonPointer.match(/^(.*)\/\d$/);

      if (ignore.includes('arrayItem') && isArrayItem) {
        return;
      } else if (schema.type === 'array') {
        if (
          ignore.includes('array') ||
          (ignore.includes('objectArray') && schema.items.type === 'object')
        ) {
          return;
        }
      } else if (schema.type === 'object') {
        if (
          ignore.includes('object') ||
          (ignore.includes('objectArrayItem') && isArrayItem)
        ) {
          return;
        }
      }

      const field = getFieldFromJsonPointer(jsonPointer);

      highlights.push({
        id: getHighlightElemIdFromSchemaElemId(schemaElem.id),
        field,
        jsonPointer,
        ...this.getDimensions(schemaElem),
        schemaElem,
        selected: false,
      });
    });

    return highlights;
  }

  private getHighlightIndexesBySelectedProp(
    highlights: HighlightData[],
    prop: keyof Pick<HighlightData, 'field' | 'jsonPointer'>,
  ): Record<string, number[]> {
    const result: Record<string, number[]> = {};

    highlights.forEach((highlight, idx) => {
      if (!result[highlight[prop]]) {
        result[highlight[prop]] = [];
      }
      result[highlight[prop]].push(idx);
    });

    return result;
  }

  private getHighlightSelectedByIdx(
    selected: string[],
    highlightIndexesBySelectedProp: Record<string, number[]>,
  ) {
    const result: Record<number, boolean> = {};

    selected.forEach((fieldOrJsonPointer) => {
      highlightIndexesBySelectedProp[fieldOrJsonPointer]?.forEach((idx) => {
        result[idx] = true;
      });
    });

    return result;
  }

  private getDimensions(schemaElem: HTMLElement): HighlightDimensions {
    const { top, width, left, height } = schemaElem.getBoundingClientRect();
    const { top: offsetTop = 0, left: offsetLeft = 0 } =
      this.formContainerElem()?.offsetParent?.getBoundingClientRect() || {};

    return { top: top - offsetTop, width, left: left - offsetLeft, height };
  }

  private scheduleResizeUpdate() {
    if (this.resizeRafId !== null) {
      return;
    }

    this.resizeRafId = requestAnimationFrame(() => {
      this.resizeRafId = null;
      this.updateDimensions();
    });
  }
}
