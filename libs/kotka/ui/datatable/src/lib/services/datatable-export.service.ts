import { concatAll, from, Observable, of, switchMap, tap, toArray } from 'rxjs';
import { map } from 'rxjs/operators';
import { CellRendererComponent } from '../renderers/cell-renderer';
import { ExportService } from '@kotka/services';
import { Injectable, Injector } from '@angular/core';
import { DatatableColumn, DatatableSource, GetRowsParams } from '@kotka/shared/models';

@Injectable({
  providedIn: 'root'
})
export class DatatableExportService {
  constructor(
    private exportService: ExportService,
    private injector: Injector
  ) {}

  exportData(columns: DatatableColumn[], datasource: DatatableSource, totalCount: number) {
    this.fetchRawData(datasource, totalCount).pipe(
      switchMap(data => this.getProcessedData(columns, data)),
      switchMap(data => this.exportService.export(data, 'export'))
    ).subscribe();
  }

  private getProcessedData(columns: DatatableColumn[], data: any[]): Observable<string[][]> {
    return this.fetchExtraData(columns, data).pipe(
      map(extraData => this.getExportData(columns, data, extraData))
    );
  }

  private fetchExtraData(columns: DatatableColumn[], data: any[]): Observable<Record<string, any>> {
    const result: Record<string, any> = {};

    const observables: Observable<any>[] = [];

    columns.forEach(col => {
      if (col.cellRenderer) {
        observables.push(
          (col.cellRenderer as typeof CellRendererComponent).fetchDataNeededForExport(col, data, this.injector).pipe(
            tap(data => {
              console.log(data);
              if (col.colId) {
                result[col.colId] = data;
              }
            })
          )
        );
      }
    });

    if (observables.length === 0) {
      return of(result);
    }

    return from(observables).pipe(concatAll(), toArray(), map(() => (result)));
  }

  private getExportData(columns: DatatableColumn[], data: any[], extraData: Record<string, any>): string[][] {
    const result: string[][] = [];
    result.push(columns.map(col => col.headerName || ''));

    data.forEach(item => {
      const rowResult: string[] = [];

      columns.forEach(col => {
        let value: string;

        const rawValue = item[col.field || ''];
        if (col.cellRenderer) {
          value = (col.cellRenderer as typeof CellRendererComponent).getExportValue(
            rawValue, item, col.cellRendererParams, extraData[col.colId || '']
          );
        } else {
          value = CellRendererComponent.getExportValue(rawValue, item);
        }

        rowResult.push(value);
      });

      result.push(rowResult);
    });

    return result;
  }

  private fetchRawData(datasource: DatatableSource, totalCount: number): Observable<any[]> {
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
