import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { LajiForm } from '@kotka/shared/models';
import { CellRendererComponent } from './cell-renderer';

interface RendererExtraParams {
  field: LajiForm.Field;
}

type RendererParams = ICellRendererParams & RendererExtraParams;

@Component({
  selector: 'kui-enum-cell-renderer',
  template: `
    <span
      *ngIf="params.value && params.field"
      title="{{ params.value | enum: params.field }}"
    >
      {{ params.value | enum: params.field }}
    </span>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnumCellRendererComponent extends CellRendererComponent<RendererParams> {
  static override getExportValue(
    value: string | undefined,
    row: any,
    params: RendererExtraParams,
  ): string {
    if (!value) {
      return '';
    }

    const valueOptions = params.field.options?.value_options;
    return valueOptions?.[value || ''] || '';
  }
}
