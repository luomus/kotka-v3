import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { CellRendererComponent } from './cell-renderer';

interface RendererExtraParams {
  valueMap?: Record<string, string>;
}

type RendererParams = ICellRendererParams & RendererExtraParams;

@Component({
  selector: 'kui-enum-cell-renderer',
  template: `
    @if (result) {
      <span title="{{ result }}">
        {{ result }}
      </span>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnumCellRendererComponent extends CellRendererComponent<RendererParams> {
  result?: string;

  override paramsChange() {
    this.result = EnumCellRendererComponent.getEnumValue(this.params.value, this.params.valueMap);
  }

  static override getExportValue(
    value: string | undefined,
    row: any,
    params: RendererExtraParams,
  ): string {
    return EnumCellRendererComponent.getEnumValue(value, params.valueMap);
  }

  private static getEnumValue(value: string | undefined, valueMap?: Record<string, string>): string {
    return valueMap?.[value || ''] || '';
  }
}
