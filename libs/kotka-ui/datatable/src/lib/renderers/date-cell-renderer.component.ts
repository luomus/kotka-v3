import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellRendererComponent } from './cell-renderer';
import { ICellRendererParams } from '@ag-grid-community/core';
import { formatDate } from '@angular/common';

interface RendererExtraParams {
  format?: string;
  isUTC?: boolean;
}

type RendererParams = ICellRendererParams & RendererExtraParams;

const DEFAULT_FORMAT = 'dd.MM.yyyy';

@Component({
  selector: 'kui-date-cell-renderer',
  template: `
    <span title="{{ displayValue }}">{{ displayValue }}</span>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateCellRendererComponent extends CellRendererComponent<RendererParams> {
  displayValue = '';

  override paramsChange() {
    if (!this.params.value) {
      this.displayValue = '';
      return;
    }

    this.displayValue = DateCellRendererComponent.getExportValue(this.params.value, this.params.data, this.params);
  }

  static override getExportValue(
    value: string | undefined,
    row: any,
    params?: RendererExtraParams,
  ): string {
    if (!value) {
      return '';
    }

    return formatDate(value, params?.format || DEFAULT_FORMAT, 'en_US') + (params?.isUTC ? ' UTC' : '');
  }
}
