import { inject, Injectable } from '@angular/core';
import { Router, UrlSerializer } from '@angular/router';
import { FieldValue } from '../specimen-search-filters/aggregations.component';
import { IndexType } from '@kotka/shared/models';
import { INDEX_OPTIONS } from '../specimen-search-main/specimen-search-main.component';
import { WINDOW } from '@kotka/ui/core';
import { DatatableSort } from '@kotka/ui/datatable';
import { IdSearchValue, parseIdQuery } from '@kotka/ui/search';

type SearchLinkParamKeys = 'index' | 'aggregateFields' | 'aggregateSize' | 'filters' | 'idSearch' | 'query' | 'selected' | 'sort';

type SearchLinkParams = { [key in SearchLinkParamKeys | string]?: string | number | boolean };

interface ParsedSearchLinkParams {
  index?: IndexType;
  aggregateFields?: string[];
  aggregateSize?: number;
  filtersValue?: FieldValue[];
  idSearchValue?: IdSearchValue;
  textSearchQuery?: string;
  selectedColumns?: string[];
  sort?: DatatableSort;
}

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
    filtersValue: FieldValue[],
    idSearchValue: IdSearchValue,
    textSearchQuery: string,
    selectedColumns: string[],
    sort: DatatableSort
  ): string {
    const queryParams: SearchLinkParams = {
      index,
      aggregateFields: aggregateFields.join(','),
      aggregateSize,
      ...this.filtersValueToParams(filtersValue),
      selected: selectedColumns.join(','),
    };
    if (idSearchValue.text) {
      queryParams.idSearch = idSearchValue.text;
    }
    if (textSearchQuery) {
      queryParams.query = textSearchQuery;
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

  parseSearchLinkParams(queryParams: SearchLinkParams): ParsedSearchLinkParams {
    const index = this.isValidIndex(queryParams.index) ? queryParams.index : undefined;
    const aggregateFields = this.parseStringArrayParam(queryParams.aggregateFields);
    const aggregateSize = this.parseNumberParam(queryParams.aggregateSize);
    const filtersValue = this.parseFiltersValueParam(queryParams);
    const idSearchValue = this.parseIdSearchParam(queryParams.idSearch);
    const textSearchQuery = this.parseStringParam(queryParams.query);
    const selectedColumns = this.parseStringArrayParam(queryParams.selected);
    const sort = this.parseSortParam(queryParams.sort);

    return {
      index,
      aggregateFields,
      aggregateSize,
      filtersValue,
      idSearchValue,
      textSearchQuery,
      selectedColumns,
      sort,
    };
  }

  private filtersValueToParams(filtersValue: FieldValue[]): Record<string, any> {
    const result: Record<string, any> = {};

    return filtersValue.reduce((params, value) => {
      params[`filters.${value.field}`] = value.value;
      return params;
    }, result);
  }

  private stringifySort(sort: DatatableSort): string {
    return sort.map(s => `${s.colId} ${s.sort}`).join(',');
  }

  private parseFiltersValueParam(queryParams: SearchLinkParams): FieldValue[] | undefined {
    const filtersValue: FieldValue[] | undefined = Object.keys(queryParams)
      .filter(key => key.startsWith('filters.'))
      .map(key => ({
        field: key.replace('filters.', ''),
        value: queryParams[key],
      }))
      .filter((value): value is FieldValue => value.value !== undefined);
    return filtersValue.length > 0 ? filtersValue : undefined;
  }

  private parseIdSearchParam(param: any): IdSearchValue | undefined {
    const text = this.parseStringParam(param);
    if (!text) {
      return undefined;
    }

    try {
      return { text, query: parseIdQuery(text) };
    } catch {
      return undefined;
    }
  }

  private parseSortParam(param: any): DatatableSort | undefined {
    if (typeof param !== 'string') {
      return undefined;
    }
    return param.split(',').reduce((result, s) => {
      const [colId, sortOrder] = s.split(' ');
      if (colId && (sortOrder === 'asc' || sortOrder === 'desc')) {
        result.push({ colId, sort: sortOrder });
      }
      return result;
    }, <DatatableSort>[]);
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
