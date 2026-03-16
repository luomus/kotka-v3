import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { LajiForm } from '@kotka/shared/models';
import { CellRendererComponent } from './cell-renderer';
import { EnumPipe, getEnumValue } from '@kotka/ui/core';

interface RendererExtraParams {
  field: LajiForm.Field;
}

type RendererParams = ICellRendererParams & RendererExtraParams;

@Component({
  selector: 'kui-enum-cell-renderer',
  template: `
    @if (params.value && params.field) {
      <span
        title="{{ params.value | enum: params.field }}"
        >
        {{ params.value | enum: params.field }}
      </span>
    }
    `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EnumPipe]
})
export class EnumCellRendererComponent extends CellRendererComponent<RendererParams> {
  static override getExportValue(
    value: string | undefined,
    row: any,
    params: RendererExtraParams,
  ): string {
    return getEnumValue(value, params.field);
  }
}
