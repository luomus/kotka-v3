import { concatAll, from, Observable, of, switchMap, tap, toArray } from 'rxjs';
import { map } from 'rxjs/operators';
import { CellRendererComponent } from '../renderers/cell-renderer';
import { ExportService } from '@kotka/ui/util-services';
import { Injectable, Injector } from '@angular/core';
import {
  ColDef,
  DatatableSource,
  FilterModel,
  GetRowsParams,
  SortModel
} from '../models/models';
import { JSONPath } from 'jsonpath-plus';

@Injectable({
  providedIn: 'root',
})
export class DatatableExportService {
  constructor(
    private exportService: ExportService,
    private injector: Injector,
  ) {}

  exportData(
    columns: ColDef[],
    datasource: DatatableSource,
    totalCount: number,
    sortModel: SortModel[],
    filterModel: FilterModel,
  ): Observable<void> {
    return this.fetchRawData(
      datasource,
      totalCount,
      sortModel,
      filterModel,
    ).pipe(
      switchMap((data) => this.getProcessedData(columns, data)),
      switchMap((data) => this.exportService.export(data, 'export')),
    );
  }

  private getProcessedData(
    columns: ColDef[],
    data: any[],
  ): Observable<string[][]> {
    return this.fetchExtraData(columns, data).pipe(
      map((extraData) => this.getExportData(columns, data, extraData)),
    );
  }

  private fetchExtraData(
    columns: ColDef[],
    data: any[],
  ): Observable<Record<string, any>> {
    const result: Record<string, any> = {};

    const observables: Observable<any>[] = [];

    columns.forEach((col) => {
      if (col.cellRenderer) {
        observables.push(
          (col.cellRenderer as typeof CellRendererComponent)
            .fetchDataNeededForExport(col, data, this.injector)
            .pipe(
              tap((data) => {
                result[col.colId] = data;
              }),
            ),
        );
      }
    });

    if (observables.length === 0) {
      return of(result);
    }

    return from(observables).pipe(
      concatAll(),
      toArray(),
      map(() => result),
    );
  }

  private getExportData(
    columns: ColDef[],
    data: any[],
    extraData: Record<string, any>,
  ): string[][] {
    const result: string[][] = [];
    result.push(columns.map((col) => col.headerName || ''));

    data.forEach((item) => {
      const rowResult: string[] = [];

      columns.forEach((col) => {
        let value: string;

        const rawValue = JSONPath({ path: col.field || '', json: item, wrap: false });

        if (col.cellRenderer) {
          value = (
            col.cellRenderer as typeof CellRendererComponent
          ).getExportValue(
            rawValue,
            item,
            col.cellRendererParams,
            extraData[col.colId],
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

  private fetchRawData(
    datasource: DatatableSource,
    totalCount: number,
    sortModel: SortModel[],
    filterModel: FilterModel,
  ): Observable<any[]> {
    return new Observable((observer) => {
      const params: GetRowsParams = {
        startRow: 0,
        endRow: totalCount,
        sortModel,
        successCallback: (data: any[]) => {
          observer.next(data);
        },
        failCallback: () => {
          observer.error();
        },
        filterModel,
        context: {},
      };

      datasource.getRows(params);
    });
  }
}
