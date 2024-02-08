import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

export class CellRendererComponent<T extends ICellRendererParams = ICellRendererParams> implements ICellRendererAngularComp {
  params!: T;

  agInit(params: T): void {
    this.params = params;
    this.paramsChange();
  }

  refresh(params: T): boolean {
    this.params = params;
    this.paramsChange();
    return true;
  }

  paramsChange(): void {}
}
