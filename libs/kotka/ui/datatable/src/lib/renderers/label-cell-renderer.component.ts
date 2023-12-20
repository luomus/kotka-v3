import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { LajiForm } from '@kotka/shared/models';

@Component({
  selector: 'kui-label-cell-renderer',
  template: `
    <span title="{{ value | label }}">{{ value | label }}</span>
  `,
  styles: []
})
export class LabelCellRendererComponent implements ICellRendererAngularComp {
  value = '';

  agInit(params: any): void {
    this.value = params.getValue();
  }

  refresh(params: ICellRendererParams<any>): boolean {
    return false;
  }
}
