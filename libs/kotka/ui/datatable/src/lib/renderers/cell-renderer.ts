import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Observable, of } from 'rxjs';

export class CellRendererComponent<T extends ICellRendererParams = ICellRendererParams> implements ICellRendererAngularComp {
  params!: ICellRendererParams & T;

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getExportValue(value: any, row: any, params?: any, fetchData?: any): string {
    if (value === undefined || value === null) {
      return '';
    }
    return '' + value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static fetchDataNeededForExport(data: any[]): Observable<any> {
    return of(undefined);
  }
}
