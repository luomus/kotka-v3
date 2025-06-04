import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

export type FieldChooserColorTheme = 'red'|'yellow';

@Component({
  selector: 'kui-laji-form-field-chooser-highlight',
  template: ` <button
    [id]="id()"
    class="laji-form-field-chooser-highlight"
    [ngClass]="'laji-form-field-chooser-highlight-' + colorTheme()"
    [attr.aria-pressed]="selected()"
    [attr.aria-label]="label()"
    [style.top]="top() + 'px'"
    [style.left]="left() + 'px'"
    [style.width]="width() + 'px'"
    [style.height]="height() + 'px'"
    (click)="onSelect()"
  ></button>`,
  styles: [
    `
      .laji-form-field-chooser-highlight {
        background: transparent;
        border: none;
        position: absolute;
        z-index: 2;
      }

      .laji-form-field-chooser-highlight.laji-form-field-chooser-highlight-red:focus-visible,
      .laji-form-field-chooser-highlight.laji-form-field-chooser-highlight-red:hover {
        background-color: rgb(220, 53, 69, 10%);
      }

      .laji-form-field-chooser-highlight.laji-form-field-chooser-highlight-red[aria-pressed='true'] {
        background-color: rgb(220, 53, 69, 60%);
      }

      .laji-form-field-chooser-highlight.laji-form-field-chooser-highlight-yellow:focus-visible,
      .laji-form-field-chooser-highlight.laji-form-field-chooser-highlight-yellow:hover {
        background-color: rgb(255, 193, 7, 10%);
      }

      .laji-form-field-chooser-highlight.laji-form-field-chooser-highlight-yellow[aria-pressed='true'] {
        background-color: rgb(255, 193, 7, 60%);
      }
    `,
  ],
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LajiFormFieldChooserHighlightComponent {
  id = input.required<string>();
  top = input.required<number>();
  left = input.required<number>();
  width = input.required<number>();
  height = input.required<number>();
  label = input.required<string>();
  selected = input(false);
  colorTheme = input<FieldChooserColorTheme>('red');

  selectedChange = output<boolean>();

  onSelect() {
    this.selectedChange.emit(!this.selected());
  }
}
