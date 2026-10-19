import { inject, Injectable } from '@angular/core';
import { Params, Router, UrlSerializer } from '@angular/router';
import { FieldValue } from './aggregations.component';
import { IndexType } from '@kotka/shared/models';
import { INDEX_OPTIONS } from './specimen-table.component';
import { WINDOW } from '@kotka/ui/core';
import { DatatableSort } from '@kotka/ui/datatable';

@Injectable({
  providedIn: 'root',
})
export class SpecimenLinkService {
  private router = inject(Router);
  private serializer = inject(UrlSerializer);
  private window = inject(WINDOW);

  getSearchLink(
    index: IndexType,
    aggregateFields: string[],
    aggregateSize: number,
    aggregateValues: FieldValue[],
    idSearchText: string,
    inputSearchQuery: string,
    selectedFields: string[],
    sort: DatatableSort
  ): string {
    const queryParams: Record<string, any> = {
      index,
      aggregateFields: aggregateFields.join(','),
      aggregateSize,
      ...this.aggregateValuesToParams(aggregateValues),
      selectedFields: selectedFields.join(','),
    };
    if (idSearchText) {
      queryParams.idSearchText = idSearchText;
    }
    if (inputSearchQuery) {
      queryParams.inputSearchQuery = inputSearchQuery;
    }
    const sortString = this.stringifySort(sort);
    if (sortString) {
      queryParams.sort = sortString;
    }

    const tree = this.router.createUrlTree(
      [],
      { queryParams }
    );

    return this.window.location.origin + this.serializer.serialize(tree);
  }

  parseSearchLinkParams(queryParams: Params): {
    index?: IndexType;
    aggregateFields?: string[];
    aggregateSize?: number;
    aggregateValues?: FieldValue[];
    idSearchText?: string;
    inputSearchQuery?: string;
    selectedFields?: string[];
    sort?: DatatableSort;
  } {
    const index = this.isValidIndex(queryParams['index']) ? queryParams['index'] : undefined;
    const aggregateFields = this.parseStringArrayParam(queryParams['aggregateFields']);
    const aggregateSize = this.parseNumberParam(queryParams['aggregateSize']);
    let aggregateValues: FieldValue[] | undefined = Object.keys(queryParams)
      .filter(key => key.startsWith('aggregateValues.'))
      .map(key => ({
        field: key.replace('aggregateValues.', ''),
        value: queryParams[key],
      }));
    aggregateValues = aggregateValues.length > 0 ? aggregateValues : undefined;
    const idSearchText = this.parseStringParam(queryParams['idSearchText']);
    const inputSearchQuery = this.parseStringParam(queryParams['inputSearchQuery']);
    const selectedFields = this.parseStringArrayParam(queryParams['selectedFields']);
    const sort = this.parseSortParam(queryParams['sort']);

    return {
      index,
      aggregateFields,
      aggregateSize,
      aggregateValues,
      idSearchText,
      inputSearchQuery,
      selectedFields,
      sort,
    };
  }

  private aggregateValuesToParams(aggregateValues: FieldValue[]): Record<string, any> {
    const result: Record<string, any> = {};

    return aggregateValues.reduce((params, value) => {
      params[`aggregateValues.${value.field}`] = value.value;
      return params;
    }, result);
  }

  private stringifySort(sort: DatatableSort): string {
    return sort.map(s => `${s.colId} ${s.sort}`).join(',');
  }

  private parseSortParam(param: any): DatatableSort | undefined {
    if (typeof param !== 'string') {
      return undefined;
    }
    return param.split(',').map(s => {
      const [colId, sortOrder] = s.split(' ');
      return { colId, sort: sortOrder as 'asc' | 'desc' };
    });
  }

  private parseStringParam(param: any): string | undefined {
    if (typeof param === 'string') {
      return param.trim();
    }
    return undefined;
  }

  private parseStringArrayParam(param: any): string[] | undefined {
    if (typeof param === 'string') {
      return param.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    return undefined;
  }

  private parseNumberParam(param: any): number | undefined {
    const num = parseInt(param, 10);
    return isNaN(num) ? undefined : num;
  }

  private isValidIndex(index: any): index is IndexType {
    return INDEX_OPTIONS.includes(index);
  }
}
