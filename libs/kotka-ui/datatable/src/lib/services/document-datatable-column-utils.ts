import { BooleanFilterComponent } from '../filters/boolean-filter.component';
import { BooleanFloatingFilterComponent } from '../filters/boolean-floating-filter.component';
import { DatatableColumn } from '../models/models';
import { LabelCellRendererComponent } from '../renderers/label-cell-renderer.component';
import {
  AutocompleteFilterParams,
  AutocompleteFloatingFilterComponent,
} from '../filters/autocomplete-floating-filter.component';
import { DateCellRendererComponent } from '../renderers/date-cell-renderer.component';
import { EnumCellRendererComponent } from '../renderers/enum-cell-renderer.component';
import { EnumFloatingFilterComponent } from '../filters/enum-floating-filter.component';
import {
  URICellRendererComponent,
  URICellRendererParams,
} from '../renderers/uri-cell-renderer.component';

export function getUriColumnOptions(params?: URICellRendererParams): DatatableColumn {
  return {
    cellRenderer: URICellRendererComponent,
    cellRendererParams: params,
    width: 145,
    flex: 0,
    lockPosition: 'left',
    defaultSelected: true,
    cellStyle: params?.showEditLink === false ? { lineHeight: 'normal' } : undefined,
  };
}

export function getBooleanColumnOptions(): DatatableColumn {
  return {
    cellRenderer: LabelCellRendererComponent,
    filter: BooleanFilterComponent,
    floatingFilterComponent: BooleanFloatingFilterComponent,
    suppressFloatingFilterButton: true,
    suppressHeaderFilterButton: true,
    width: 100,
    minWidth: 100,
    flex: 0
  };
}

export function getDateColumnOptions(): DatatableColumn {
  return {
    cellRenderer: DateCellRendererComponent,
    filter: 'agDateColumnFilter',
    filterParams: {
      inRangeFloatingFilterDateFormat: 'DD.MM.YYYY',
    },
  };
}

export function getEnumColumnOptions(valueMap?: Record<string, string>) {
  return {
    cellRenderer: EnumCellRendererComponent,
    cellRendererParams: {
      valueMap,
    },
    floatingFilterComponent: EnumFloatingFilterComponent,
    floatingFilterComponentParams: {
      valueMap,
    },
    suppressFloatingFilterButton: true,
    suppressHeaderFilterButton: true
  };
}

export function getAutocompleteColumnOptions(type: AutocompleteFilterParams['type']): DatatableColumn {
  return {
    cellRenderer: LabelCellRendererComponent,
    floatingFilterComponent: AutocompleteFloatingFilterComponent,
    floatingFilterComponentParams: {
      type
    },
    suppressFloatingFilterButton: true,
    suppressHeaderFilterButton: true,
    sortable: false
  };
}
