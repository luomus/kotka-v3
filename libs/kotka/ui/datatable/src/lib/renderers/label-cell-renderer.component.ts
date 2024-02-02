import { Component } from '@angular/core';
import { CellRendererComponent } from './cell-renderer';

@Component({
  selector: 'kui-label-cell-renderer',
  template: `
    <span title="{{ params.value | label }}">{{ params.value | label }}</span>
  `,
  styles: []
})
export class LabelCellRendererComponent extends CellRendererComponent {}
