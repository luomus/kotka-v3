import { FieldValue } from '../specimen-search-filters/aggregations.component';
import { builderQueryToQueryString, IdSearchValue, joinQueryStrings } from '@kotka/ui/search';

export function getSpecimenSearchQuery(filtersValue: FieldValue[], idSearchValue: IdSearchValue, textSearchQuery: string): string {
  return joinQueryStrings(
    'AND',
    filtersValueToSearchQuery(filtersValue),
    builderQueryToQueryString(idSearchValue.query),
    textSearchQuery,
  );
}

function filtersValueToSearchQuery(fieldValues: FieldValue[]): string {
  return builderQueryToQueryString({
    groups: [
      {
        criteria: fieldValues.map((fieldValue) => ({
          field: fieldValue.field,
          operator: 'equals',
          value: `${fieldValue.value}`,
        })),
        joinOperator: 'AND',
      },
    ],
    joinOperator: 'AND',
  });
}
