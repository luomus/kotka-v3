import { Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { LajiForm } from '@kotka/shared/models';
import { CellRendererComponent } from './cell-renderer';

interface RendererParams extends ICellRendererParams {
  field: LajiForm.Field
}

@Component({
  selector: 'kui-enum-cell-renderer',
  template: `
    <span *ngIf="params.value && params.field" title="{{ params.value | enum: params.field }}">
      {{ params.value | enum: params.field }}
    </span>
  `,
  styles: []
})
export class EnumCellRendererComponent extends CellRendererComponent<RendererParams> {}
