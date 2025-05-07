import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'kui-laji-form-field-chooser-highlight',
  template: `
    <button
      [id]="id()"
      class="laji-form-field-chooser-highlight"
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
        z-index: 1039;
      }
      .laji-form-field-chooser-highlight:focus-visible, .laji-form-field-chooser-highlight:hover {
        background-color: rgb(220, 53, 69, 10%);
      }
      .laji-form-field-chooser-highlight[aria-pressed="true"] {
        background-color: rgb(220, 53, 69, 60%);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormFieldChooserHighlightComponent {
  id = input.required<string>();
  top = input.required<number>();
  left = input.required<number>();
  width = input.required<number>();
  height = input.required<number>();
  label = input.required<string>();
  selected = input(false);

  selectedChange = output<boolean>();

  onSelect() {
    this.selectedChange.emit(!this.selected());
  }
}
