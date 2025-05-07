import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'kui-laji-form-field-chooser-highlight',
  template: `
    <div
      [id]="id()"
      [ngClass]="['laji-form-field-chooser-highlight', selected() ? 'laji-form-field-chooser-highlight-selected' : '']"
      [style.top]="top() + 'px'"
      [style.left]="left() + 'px'"
      [style.width]="width() + 'px'"
      [style.height]="height() + 'px'"
      tabindex="0"
      (click)="onSelect()"
      (keydown)="onKeydown($event)"
    ></div>`,
  styles: [
    `
      .laji-form-field-chooser-highlight {
        position: absolute;
        z-index: 1039;
      }
      .laji-form-field-chooser-highlight:focus-visible, .laji-form-field-chooser-highlight:hover {
        background-color: rgb(220, 53, 69, 10%);
      }
      .laji-form-field-chooser-highlight-selected {
        background-color: rgb(220, 53, 69, 60%) !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class LajiFormFieldChooserHighlightComponent {
  id = input.required<string>();
  top = input.required<number>();
  left = input.required<number>();
  width = input.required<number>();
  height = input.required<number>();
  selected = input(false);

  selectedChange = output<boolean>();

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.onSelect();
      event.preventDefault();
    }
  }

  onSelect() {
    this.selectedChange.emit(!this.selected());
  }
}
