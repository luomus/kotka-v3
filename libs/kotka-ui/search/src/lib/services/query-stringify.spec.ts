import { BuilderQuery, MultiSearchField } from '../models';
import { builderQueryToQueryString } from './query-stringify';

const multiField: MultiSearchField = {
  field: 'multiField',
  label: 'Multi Field',
  fields: ['a', 'b', 'c'],
  type: 'keyword',
};
const multiFieldMap = { [multiField.field]: multiField };

describe('Multi search fields', () => {
  it('converts a multi field criteria into an OR query', () => {
    const query: BuilderQuery = {
      groups: [
        {
          criteria: [{ field: 'multiField', operator: 'equals', value: 'value' }],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    };

    expect(builderQueryToQueryString(query, multiFieldMap)).toEqual(
      '(a:"value" OR b:"value" OR c:"value")',
    );
  });

  it('converts a multi field criteria with other criteria into an OR query', () => {
    const query: BuilderQuery = {
      groups: [
        {
          criteria: [
            { field: 'multiField', operator: 'contains', value: 'value' },
            { field: 'd', operator: 'equals', value: 'other' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    };

    expect(builderQueryToQueryString(query, multiFieldMap)).toEqual(
      '(a:*value* OR b:*value* OR c:*value*) AND d:"other"',
    );
  });

  it('converts a negated multi field criteria into an AND query', () => {
    const query: BuilderQuery = {
      groups: [
        {
          criteria: [{ field: 'multiField', operator: 'notEqual', value: 'value' }],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    };

    expect(builderQueryToQueryString(query, multiFieldMap)).toEqual(
      '(NOT a:"value" AND NOT b:"value" AND NOT c:"value")',
    );
  });

  it('converts a blank multi field criteria into an OR query', () => {
    const query: BuilderQuery = {
      groups: [
        {
          criteria: [{ field: 'multiField', operator: 'notBlank', value: '' }],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    };

    expect(builderQueryToQueryString(query, multiFieldMap)).toEqual(
      '(_exists_:a OR _exists_:b OR _exists_:c)',
    );
  });

  it('converts a multi field criteria in multiple groups', () => {
    const query: BuilderQuery = {
      groups: [
        {
          criteria: [
            { field: 'multiField', operator: 'notContains', value: 'value' },
            { field: 'd', operator: 'equals', value: 'value2' },
          ],
          joinOperator: 'AND',
        },
        {
          criteria: [
            { field: 'e', operator: 'notBlank', value: 'value3' },
            { field: 'multiField', operator: 'startsWith', value: 'value4' },
          ],
          joinOperator: 'OR',
        },
      ],
      joinOperator: 'AND',
    };

    expect(builderQueryToQueryString(query, multiFieldMap)).toEqual(
      '((NOT a:*value* AND NOT b:*value* AND NOT c:*value*) AND d:"value2") AND (_exists_:e OR (a:value4* OR b:value4* OR c:value4*))',
    );
  });
});
