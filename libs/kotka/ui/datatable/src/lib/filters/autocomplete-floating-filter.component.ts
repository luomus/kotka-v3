import { Component } from '@angular/core';
import {
  IFloatingFilterParams,
  ISimpleFilter
} from '@ag-grid-community/core';
import { IFloatingFilterAngularComp } from '@ag-grid-community/angular';
import { ApiClient } from '@kotka/services';
import { KotkaUiAutocompleteModule, FetchAutocompleteResultsFunc } from '@kotka/ui/autocomplete';

interface FilterExtraParams {
  type: 'organization'|'collection'
}

@Component({
  standalone: true,
  imports: [KotkaUiAutocompleteModule],
  template: `
    <div class="ag-floating-filter-input">
      <kui-autocomplete
        [value]="currentFilter"
        [fetchResultsFunc]="fetchResultsFunc"
        [inputClassName]="'ag-input-field-input ag-text-field-input'"
        (valueChange)="changeFilterValue($event)"
      ></kui-autocomplete>
    </div>
  `,
})
export class AutocompleteFloatingFilterComponent implements IFloatingFilterAngularComp {
  params!: IFloatingFilterParams & FilterExtraParams;

  currentFilter?: string;
  fetchResultsFunc: FetchAutocompleteResultsFunc;

  constructor(
    private apiClient: ApiClient
  ) {
    this.fetchResultsFunc = this.getAutocompleteResults.bind(this);
  }

  agInit(params: IFloatingFilterParams<ISimpleFilter> & FilterExtraParams): void {
    this.params = params;
  }

  onParentModelChanged(parentModel: any) {
    if (!parentModel) {
      this.currentFilter = undefined;
    } else {
      this.currentFilter = parentModel.filter;
    }
  }

  changeFilterValue(value: string|null = null) {
    this.params.parentFilterInstance(instance => {
      instance.onFloatingFilterChanged('equals', value);
    });
  }

  private getAutocompleteResults(term: string) {
    if (this.params.type === 'organization') {
      return this.apiClient.getOrganizationAutocomplete(term);
    } else {
      return this.apiClient.getCollectionAutocomplete(term);
    }
  }
}
