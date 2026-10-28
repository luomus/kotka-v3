import { inject, Injectable } from '@angular/core';
import { Router, UrlSerializer } from '@angular/router';
import {
  FieldValue,
  LocationFilter,
  SpecimenSearchFilters,
} from '../models/models';
import {
  IndexType,
} from '@kotka/shared/models';
import { INDEX_OPTIONS } from '../specimen-search-main/specimen-search-main.component';
import { WINDOW } from '@kotka/ui/core';
import { DatatableSort } from '@kotka/ui/datatable';
import { IdSearchValue, parseIdQuery } from '@kotka/ui/search';
import { areValidWGS84Coordinates } from '@kotka/shared/utils';

const FIELD_PARAM_PREFIX = 'field.';

type FieldParamKey = `field.${string}`;
type SearchLinkParamKeys = 'index' | 'aggFields' | 'aggSize' | 'id' | 'query' | 'cols' | 'sort' | 'loc' | FieldParamKey;

type SearchLinkParams = { [key in SearchLinkParamKeys]?: any };

interface ParsedSearchLinkParams {
  index?: IndexType;
  aggregateFields?: string[];
  aggregateSize?: number;
  filters?: SpecimenSearchFilters;
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
    filters: SpecimenSearchFilters,
    idSearchValue: IdSearchValue,
    textSearchQuery: string,
    selectedColumns: string[],
    sort: DatatableSort
  ): string {
    const queryParams: SearchLinkParams = {
      index,
      aggFields: aggregateFields.join(','),
      aggSize: aggregateSize,
      ...this.filtersToParams(filters),
      cols: selectedColumns.join(','),
    };
    if (idSearchValue.text) {
      queryParams.id = idSearchValue.text;
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
    const aggregateFields = this.parseStringArrayParam(queryParams.aggFields);
    const aggregateSize = this.parseIntegerParam(queryParams.aggSize);
    const filters = this.parseFilters(queryParams);
    const idSearchValue = this.parseIdSearchParam(queryParams.id);
    const textSearchQuery = this.parseStringParam(queryParams.query);
    const selectedColumns = this.parseStringArrayParam(queryParams.cols);
    const sort = this.parseSortParam(queryParams.sort);

    return {
      index,
      aggregateFields,
      aggregateSize,
      filters,
      idSearchValue,
      textSearchQuery,
      selectedColumns,
      sort,
    };
  }

  private filtersToParams(filters: SpecimenSearchFilters): SearchLinkParams {
    const params = this.fieldValuesToParams(filters.fieldValues);
    if (filters.location) {
      params.loc = [filters.location.latitude, filters.location.longitude, filters.location.radius].join(',');
    }
    return params;
  }

  private fieldValuesToParams(filtersValue: FieldValue[]): SearchLinkParams {
    const result: SearchLinkParams = {};

    filtersValue.reduce((res, value) => {
      const key: FieldParamKey = `${FIELD_PARAM_PREFIX}${value.field}`;
      if (!res[key]) {
        res[key] = [];
      }
      res[key].push(value.value);
      return res;
    }, result);

    return result;
  }

  private stringifySort(sort: DatatableSort): string {
    return sort.map(s => `${s.colId} ${s.sort}`).join(',');
  }

  parseFilters(queryParams: SearchLinkParams): SpecimenSearchFilters | undefined {
    const location = this.parseLocationParam(queryParams.loc);
    const fieldValues = this.parseFieldValues(queryParams);

    if (!location && !fieldValues) {
      return undefined;
    }

    return { location, fieldValues: fieldValues || [] };
  }

  private parseLocationParam(param: any): LocationFilter | undefined {
    if (typeof param !== 'string') {
      return undefined;
    }

    const parts = param.split(',');
    if (parts.length !== 3) {
      return undefined;
    }

    const latitude = parseFloat(parts[0]);
    const longitude = parseFloat(parts[1]);
    const radius = parseFloat(parts[2]);

    if (!areValidWGS84Coordinates(latitude, longitude) || isNaN(radius) || radius <= 0) {
      return undefined;
    }

    return { latitude, longitude, radius };
  }

  private parseFieldValues(queryParams: SearchLinkParams): FieldValue[] | undefined {
    const result: FieldValue[] = [];

    Object.keys(queryParams)
      .reduce((res, key) => {
        if (this.isFieldParamKey(key)) {
          const field = key.replace(FIELD_PARAM_PREFIX, '');
          const value = queryParams[key];
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach((v) => res.push({ field, value: v }));
            } else {
              res.push({ field, value });
            }
          }
        }
        return res;
      }, result);

    return result.length > 0 ? result : undefined;
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

  private parseIntegerParam(param: any): number | undefined {
    const num = parseInt(param, 10);
    return isNaN(num) ? undefined : num;
  }

  private isValidIndex(index: any): index is IndexType {
    return INDEX_OPTIONS.includes(index);
  }

  private isFieldParamKey(key: string): key is FieldParamKey {
    return key.startsWith(FIELD_PARAM_PREFIX);
  }
}
