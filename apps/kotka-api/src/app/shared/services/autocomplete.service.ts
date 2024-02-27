import { Injectable } from '@nestjs/common';
import { get } from 'lodash';
import { Collection, Organization } from '@luomus/laji-schema';

export interface AutocompleteResult {
  key: string;
  value: string;
}

@Injectable()
export class AutocompleteService {
  getAutocompleteResults<T extends Collection|Organization>(allResults: T[], autocompleteKey: string, query: string, limit: number): AutocompleteResult[] {
    query = query.toUpperCase();

    const found = allResults.map(
      item => ({ ...item, autocompleteValue: get(item, autocompleteKey, '').toString().toUpperCase() })
    ).filter(item => (item.id === query || item.autocompleteValue.includes(query)));

    found.sort((a, b) => {
      if (a.id === query) {
        return -1;
      } else if (b.id === query) {
        return 1;
      }

      let sortValue = a.autocompleteValue.indexOf(query) - b.autocompleteValue.indexOf(query);
      if (sortValue === 0) {
        sortValue = a.autocompleteValue.length - b.autocompleteValue.length;
      }
      return sortValue;
    });

    return found.slice(0, limit).map(item => ({ key: item.id, value: get(item, autocompleteKey) }));
  }
}
