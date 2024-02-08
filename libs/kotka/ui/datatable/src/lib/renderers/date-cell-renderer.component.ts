import { Component } from '@angular/core';
import { CellRendererComponent } from './cell-renderer';
import { ICellRendererParams } from '@ag-grid-community/core';

interface RendererParams extends ICellRendererParams {
  format?: string
}

@Component({
  selector: 'kui-date-cell-renderer',
  template: `
    <span title="{{ params.value | date:(params.format || defaultFormat) }}">{{ params.value | date:(params.format || defaultFormat) }}</span>
  `,
  styles: []
})
export class DateCellRendererComponent extends CellRendererComponent<RendererParams> {
  defaultFormat = 'dd.MM.YYYY';
}
