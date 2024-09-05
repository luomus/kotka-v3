import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellRendererComponent } from './cell-renderer';
import { ICellRendererParams } from '@ag-grid-community/core';
import { formatDate } from '@angular/common';

interface RendererExtraParams {
  format?: string;
}

type RendererParams = ICellRendererParams & RendererExtraParams;

const DEFAULT_FORMAT = 'dd.MM.YYYY';

@Component({
  selector: 'kui-date-cell-renderer',
  template: `
    <span title="{{ params.value | date:(params.format || defaultFormat) }}">{{ params.value | date:(params.format || defaultFormat) }}</span>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateCellRendererComponent extends CellRendererComponent<RendererParams> {
  defaultFormat = DEFAULT_FORMAT;

  static override getExportValue(value: string|undefined, row: any, params?: RendererExtraParams): string {
    if (!value) {
      return '';
    }

    return formatDate(value, params?.format || DEFAULT_FORMAT, 'en_US');
  }
}
