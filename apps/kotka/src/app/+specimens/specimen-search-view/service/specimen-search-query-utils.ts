import { FieldValue, SpecimenSearchFilters } from '../models/models';
import { builderQueryToQueryString, IdSearchValue } from '@kotka/ui/search';
import { Bool, ElasticsearchQuery } from '@kotka/shared/models';
import { joinQueryStrings } from '@kotka/ui/core';

export function getSpecimenSearchQuery(
  filters: SpecimenSearchFilters,
  idSearchValue: IdSearchValue,
  textSearchQuery: string,
): string | ElasticsearchQuery {
  const queryString = joinQueryStrings(
    'AND',
    fieldValuesToSearchQuery(filters.fieldValues),
    builderQueryToQueryString(idSearchValue.query),
    textSearchQuery,
  );

  if (!filters.location) {
    return queryString;
  }

  const bool: Bool = {};
  bool['filter'] = [
    {
      geo_distance: {
        distance: filters.location.radius,
        wgs84Location: {
          lat: filters.location.latitude,
          lon: filters.location.longitude,
        },
      },
    },
  ];

  if (queryString) {
    bool['must'] = [
      {
        query_string: {
          query: queryString,
        },
      },
    ];
  }

  return {
    query: {
      bool
    },
  };
}

function fieldValuesToSearchQuery(fieldValues: FieldValue[]): string {
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
