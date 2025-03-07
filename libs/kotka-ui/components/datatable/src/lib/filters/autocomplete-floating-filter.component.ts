import { Component } from '@angular/core';
import {
  IFloatingFilterParams,
  TextFilter,
  TextFilterModel,
} from '@ag-grid-community/core';
import { IFloatingFilterAngularComp } from '@ag-grid-community/angular';
import { ApiClient } from '@kotka/ui/data-services';
import {
  AutocompleteComponent,
  FetchAutocompleteResultsFunc
} from '@kotka/ui/autocomplete';
import { KotkaDocumentObjectType } from '@kotka/shared/models';

interface FilterExtraParams {
  type:
    | KotkaDocumentObjectType.dataset
    | KotkaDocumentObjectType.organization
    | 'collection';
}

@Component({
  imports: [AutocompleteComponent],
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
export class AutocompleteFloatingFilterComponent
  implements IFloatingFilterAngularComp<TextFilter>
{
  params!: IFloatingFilterParams & FilterExtraParams;

  currentFilter?: string;
  fetchResultsFunc: FetchAutocompleteResultsFunc;

  constructor(private apiClient: ApiClient) {
    this.fetchResultsFunc = this.getAutocompleteResults.bind(this);
  }

  agInit(params: IFloatingFilterParams<TextFilter> & FilterExtraParams): void {
    this.params = params;
  }

  onParentModelChanged(parentModel?: TextFilterModel | null) {
    if (!parentModel?.filter) {
      this.currentFilter = undefined;
    } else {
      this.currentFilter = parentModel.filter;
    }
  }

  changeFilterValue(value: string | null = null) {
    this.params.parentFilterInstance((instance) => {
      instance.onFloatingFilterChanged('equals', value);
    });
  }

  private getAutocompleteResults(term: string) {
    if (this.params.type === 'collection') {
      return this.apiClient.getCollectionAutocomplete(term);
    } else {
      return this.apiClient.getAutocomplete(this.params.type, term);
    }
  }
}
