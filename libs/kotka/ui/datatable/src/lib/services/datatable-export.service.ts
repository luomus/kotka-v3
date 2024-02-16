import { DatatableColumn, DatatableSource, GetRowsParams } from '../datatable/datatable.component';
import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { CellRendererComponent } from '../renderers/cell-renderer';
import { ExportService } from '@kotka/services';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatatableExportService {
  constructor(
    private exportService: ExportService
  ) {}

  exportData(columns: DatatableColumn[], datasource: DatatableSource, totalCount: number) {
    this.getRawData(datasource, totalCount).pipe(
      map(data => this.getExportData(columns, data)),
      switchMap(data => this.exportService.export(data, 'export'))
    ).subscribe();
  }

  getExportData(columns: DatatableColumn[], data: any[]): string[][] {
    const result: string[][] = [];
    result.push(columns.map(col => col.headerName || ''));

    data.forEach(item => {
      const rowResult: string[] = [];

      columns.forEach(col => {
        let value: string;

        const rawValue = item[col.field || ''];
        if (col.cellRenderer) {
          value = (col.cellRenderer as typeof CellRendererComponent).getExportValue(rawValue, item, col.cellRendererParams);
        } else {
          value = '' + rawValue;
        }

        rowResult.push(value);
      });

      result.push(rowResult);
    });

    return result;
  }

  getRawData(datasource: DatatableSource, totalCount: number): Observable<any[]> {
    return new Observable(
      observer => {
        const params: GetRowsParams = {
          startRow: 0,
          endRow: totalCount,
          sortModel: [],
          successCallback: (data: any[]) => { observer.next(data); },
          failCallback: () => { observer.error(); },
          filterModel: {},
          context: {}
        };

        datasource.getRows(params);
      }
    );
  }
}
