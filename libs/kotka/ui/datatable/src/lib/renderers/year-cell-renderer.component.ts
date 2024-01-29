import { Component } from '@angular/core';
import { CellRendererComponent } from './cell-renderer';

@Component({
  selector: 'kui-year-cell-renderer',
  template: `
    <span title="{{ params.value | date:'YYYY' }}">{{ params.value | date:'YYYY' }}</span>
  `,
  styles: []
})
export class YearCellRendererComponent extends CellRendererComponent {}
