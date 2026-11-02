import { ElasticsearchQuery, Query } from '@kotka/shared/models';
import { JoinOperator } from '@ag-grid-community/core';

export const queryStringToObject = (
  queryString: string,
): ElasticsearchQuery => {
  if (!queryString) {
    return {};
  }

  return {
    query: {
      query_string: {
        query: queryString,
      },
    },
  };
};

export const joinQueryStrings = (
  joinOperator: JoinOperator,
  ...queries: string[]
): string => {
  queries = queries.filter(Boolean);
  if (queries.length > 1) {
    queries = queries.map((query) => `(${query})`);
  }
  return queries.join(` ${joinOperator} `);
};

export const joinQueryStringToObject = (
  searchQuery: ElasticsearchQuery,
  queryString: string,
): ElasticsearchQuery => {
  const must: Query[] = [{ query_string: { query: queryString } }];
  if (searchQuery.query) {
    must.push(searchQuery.query);
  }

  return {
    ...searchQuery,
    query: {
      bool: {
        must,
      },
    },
  };
};
