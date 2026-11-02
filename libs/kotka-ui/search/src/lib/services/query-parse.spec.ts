import { MultiSearchField } from '../models';
import { queryStringToBuilderQuery } from './query-parse';

const multiField: MultiSearchField = {
  field: 'multiField',
  label: 'Multi Field',
  fields: ['a', 'b', 'c'],
  type: 'keyword',
};
const multiFields = [multiField];

describe('Valid queries', () => {
  it('returns an empty query for an empty string', () => {
    expect(queryStringToBuilderQuery('', [])).toEqual({
      groups: [],
      joinOperator: 'AND',
    });
  });

  it('parses a single criteria into one group', () => {
    expect(queryStringToBuilderQuery('a:1', [])).toEqual({
      groups: [
        {
          criteria: [{ field: 'a', value: '1', operator: 'equals' }],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('parses multiple criteria without groups into one group', () => {
    expect(queryStringToBuilderQuery('a:1 OR b:2', [])).toEqual({
      groups: [
        {
          criteria: [
            { field: 'a', value: '1', operator: 'equals' },
            { field: 'b', value: '2', operator: 'equals' },
          ],
          joinOperator: 'OR',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('parses explicit groups', () => {
    expect(queryStringToBuilderQuery('(a:1 OR b:2) AND (c:3)', [])).toEqual({
      groups: [
        {
          criteria: [
            { field: 'a', value: '1', operator: 'equals' },
            { field: 'b', value: '2', operator: 'equals' },
          ],
          joinOperator: 'OR',
        },
        {
          criteria: [{ field: 'c', value: '3', operator: 'equals' }],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('parses value types into operators', () => {
    expect(queryStringToBuilderQuery('a:*1* AND b:2* AND c:*3', [])).toEqual({
      groups: [
        {
          criteria: [
            { field: 'a', value: '1', operator: 'contains' },
            { field: 'b', value: '2', operator: 'startsWith' },
            { field: 'c', value: '3', operator: 'endsWith' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('parses range value types into operators', () => {
    expect(queryStringToBuilderQuery('a:[0 TO 1] AND b:{0 TO *} AND c:{* TO 10]', [])).toEqual({
      groups: [
        {
          criteria: [
            { field: 'a', value: '0', value2: '1', operator: 'inRange' },
            { field: 'b', value: '0', operator: 'greaterThan' },
            { field: 'c', value: '10', operator: 'lessThanOrEqual' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('parses negation into the negated operators', () => {
    expect(queryStringToBuilderQuery('NOT a:1 AND NOT b:*2*', [])).toEqual({
      groups: [
        {
          criteria: [
            { field: 'a', value: '1', operator: 'notEqual' },
            { field: 'b', value: '2', operator: 'notContains' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('parses the _exists_ field into blank operators', () => {
    expect(queryStringToBuilderQuery('_exists_:a AND NOT _exists_:b', [])).toEqual(
      {
        groups: [
          {
            criteria: [
              { field: 'a', value: '', operator: 'notBlank' },
              { field: 'b', value: '', operator: 'blank' },
            ],
            joinOperator: 'AND',
          },
        ],
        joinOperator: 'AND',
      },
    );
  });

  it('parses values without field', () => {
    expect(queryStringToBuilderQuery('a AND b', [])).toEqual({
      groups: [
        {
          criteria: [
            { field: '', value: 'a', operator: 'equals' },
            { field: '', value: 'b', operator: 'equals' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
  });
});

describe('Invalid queries', () => {
  it('throws when the terms are in an invalid order', () => {
    expect(() => queryStringToBuilderQuery('a:1 b:2', [])).toThrow();
  });

  it('throws when criteria have different join operators', () => {
    expect(() => queryStringToBuilderQuery('a:1 AND b:2 OR c:3', [])).toThrow();
  });

  it('throws when groups have different join operators', () => {
    expect(() =>
      queryStringToBuilderQuery('(a:1) AND (b:2) OR (c:3)', []),
    ).toThrow();
  });

  it('throws when negation is used with "starts with"', () => {
    expect(() => queryStringToBuilderQuery('NOT a:1*', [])).toThrow();
  });

  it('throws when negation is used with "ends with"', () => {
    expect(() => queryStringToBuilderQuery('NOT a:*1', [])).toThrow();
  });

  it('throws when value is missing', () => {
    expect(() => queryStringToBuilderQuery('a:', [])).toThrow();
  });

  it('throws when a value is empty', () => {
    expect(() => queryStringToBuilderQuery('a:""', [])).toThrow();
  });
});

describe('Multi search fields', () => {
  it('flattens a group matching a multi field into one criteria', () => {
    expect(
      queryStringToBuilderQuery('(a:"1" OR b:"1" OR c:"1")', multiFields),
    ).toEqual({
      groups: [
        {
          criteria: [{ field: 'multiField', value: '1', operator: 'equals' }],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('flattens a group matching a multi field next to other criteria', () => {
    expect(
      queryStringToBuilderQuery(
        '(a:*1* OR b:*1* OR c:*1*) AND d:"2"',
        multiFields,
      ),
    ).toEqual({
      groups: [
        {
          criteria: [
            { field: 'multiField', value: '1', operator: 'contains' },
            { field: 'd', value: '2', operator: 'equals' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('flattens a negated multi field group joined with AND', () => {
    expect(
      queryStringToBuilderQuery(
        '(NOT a:"1" AND NOT b:"1" AND NOT c:"1")',
        multiFields,
      ),
    ).toEqual({
      groups: [
        {
          criteria: [{ field: 'multiField', value: '1', operator: 'notEqual' }],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('flattens an _exists_ multi field group', () => {
    expect(
      queryStringToBuilderQuery(
        '(_exists_:a OR _exists_:b OR _exists_:c)',
        multiFields,
      ),
    ).toEqual({
      groups: [
        {
          criteria: [{ field: 'multiField', value: '', operator: 'notBlank' }],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('flattens a multi field group with a range value', () => {
    expect(
      queryStringToBuilderQuery(
        '(a:[0 TO 10] OR b:[0 TO 10] OR c:[0 TO 10])',
        multiFields,
      ),
    ).toEqual({
      groups: [
        {
          criteria: [
            { field: 'multiField', value: '0', value2: '10', operator: 'inRange' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('flattens a multi field group nested inside another group', () => {
    expect(
      queryStringToBuilderQuery(
        '((a:"1" OR b:"1" OR c:"1") AND d:"2") OR (e:"3")',
        multiFields,
      ),
    ).toEqual({
      groups: [
        {
          criteria: [
            { field: 'multiField', value: '1', operator: 'equals' },
            { field: 'd', value: '2', operator: 'equals' },
          ],
          joinOperator: 'AND',
        },
        {
          criteria: [{ field: 'e', value: '3', operator: 'equals' }],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'OR',
    });
  });

  it('does not flatten a group that is missing one of the multi fields', () => {
    expect(
      queryStringToBuilderQuery('(a:"1" OR b:"1")', multiFields),
    ).toEqual({
      groups: [
        {
          criteria: [
            { field: 'a', value: '1', operator: 'equals' },
            { field: 'b', value: '1', operator: 'equals' },
          ],
          joinOperator: 'OR',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('does not flatten a group where the values differ', () => {
    expect(
      queryStringToBuilderQuery('(a:"1" OR b:"2" OR c:"1")', multiFields),
    ).toEqual({
      groups: [
        {
          criteria: [
            { field: 'a', value: '1', operator: 'equals' },
            { field: 'b', value: '2', operator: 'equals' },
            { field: 'c', value: '1', operator: 'equals' },
          ],
          joinOperator: 'OR',
        },
      ],
      joinOperator: 'AND',
    });
  });

  it('does not flatten a group with an unexpected join operator', () => {
    expect(
      queryStringToBuilderQuery('(a:"1" AND b:"1" AND c:"1")', multiFields),
    ).toEqual({
      groups: [
        {
          criteria: [
            { field: 'a', value: '1', operator: 'equals' },
            { field: 'b', value: '1', operator: 'equals' },
            { field: 'c', value: '1', operator: 'equals' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'AND',
    });
  });
});
