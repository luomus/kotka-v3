import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { LajiForm } from '@kotka/shared/models';

@Component({
  selector: 'kui-enum-cell-renderer',
  template: `
    <span *ngIf="value && field" title="{{ value | enum: field }}">{{ value | enum: field }}</span>
  `,
  styles: []
})
export class EnumCellRendererComponent implements ICellRendererAngularComp {
  value = '';
  field?: LajiForm.Field;

  agInit(params: any): void {
    this.value = params.getValue();
    this.field = params.field;
  }

  refresh(params: ICellRendererParams<any>): boolean {
    return false;
  }
}
