import { Injectable } from '@nestjs/common';
import { get, isNil } from 'lodash';
import { Collection, Organization } from '@luomus/laji-schema';

export interface AutocompleteResult {
  key: string;
  value: string;
}

@Injectable()
export class AutocompleteService {
  getAutocompleteResults<T extends Collection|Organization>(allResults: T[], autocompleteKey: string, query: string, limit: number): AutocompleteResult[] {
    query = query.toUpperCase();

    let result = allResults.map(
      item => {
        const autocompleteValue = get(item, autocompleteKey);
        const autocompleteValueString = !isNil(autocompleteValue) ? autocompleteValue.toString() : '';
        const autocompleteValueUpper = autocompleteValueString.toUpperCase();

        return { ...item, autocompleteValue, autocompleteValueString, autocompleteValueUpper };
      }
    );

    if (query === '') {
      result.sort((a, b) => (a.autocompleteValueString.localeCompare(b.autocompleteValueString, 'fi')));
    } else {
      const found = result.filter(item => (
        item.id === query || item.autocompleteValueUpper.includes(query))
      );

      found.sort((a, b) => {
        if (a.id === query) {
          return -1;
        } else if (b.id === query) {
          return 1;
        }

        let sortValue = a.autocompleteValueUpper.indexOf(query) - b.autocompleteValueUpper.indexOf(query);
        if (sortValue === 0) {
          sortValue = a.autocompleteValueUpper.length - b.autocompleteValueUpper.length;
        }
        return sortValue;
      });

      result = found;
    }

    return result.slice(0, limit).map(item => ({ key: item.id, value: item.autocompleteValue }));
  }
}
