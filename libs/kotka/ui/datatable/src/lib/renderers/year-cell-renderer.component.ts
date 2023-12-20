import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'kui-year-cell-renderer',
  template: `
    <span title="{{ value | date:'YYYY' }}">{{ value | date:'YYYY' }}</span>
  `,
  styles: []
})
export class YearCellRendererComponent implements ICellRendererAngularComp {
  value = '';

  agInit(params: any): void {
    this.value = params.getValue();
  }

  refresh(params: ICellRendererParams<any>): boolean {
    return false;
  }
}
