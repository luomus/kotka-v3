import { queryStringToBuilderQuery } from './query-parse';

describe('Valid queries', () => {
  it('returns an empty query for an empty string', () => {
    expect(queryStringToBuilderQuery('')).toEqual({
      groups: [],
      joinOperator: 'AND',
    });
  });

  it('parses a single criteria into one group', () => {
    expect(queryStringToBuilderQuery('a:1')).toEqual({
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
    expect(queryStringToBuilderQuery('a:1 OR b:2')).toEqual({
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
    expect(queryStringToBuilderQuery('(a:1 OR b:2) AND (c:3)')).toEqual({
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
    expect(queryStringToBuilderQuery('a:*1* AND b:2* AND c:*3')).toEqual({
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

  it('parses negation into the negated operators', () => {
    expect(queryStringToBuilderQuery('NOT a:1 AND NOT b:*2*')).toEqual({
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
    expect(queryStringToBuilderQuery('_exists_:a AND NOT _exists_:b')).toEqual(
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
    expect(queryStringToBuilderQuery('a AND b')).toEqual({
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
    expect(() => queryStringToBuilderQuery('a:1 b:2')).toThrow();
  });

  it('throws when criteria have different join operators', () => {
    expect(() => queryStringToBuilderQuery('a:1 AND b:2 OR c:3')).toThrow();
  });

  it('throws when groups have different join operators', () => {
    expect(() =>
      queryStringToBuilderQuery('(a:1) AND (b:2) OR (c:3)'),
    ).toThrow();
  });

  it('throws when negation is used with "starts with"', () => {
    expect(() => queryStringToBuilderQuery('NOT a:1*')).toThrow();
  });

  it('throws when negation is used with "ends with"', () => {
    expect(() => queryStringToBuilderQuery('NOT a:*1')).toThrow();
  });

  it('throws when a value is empty', () => {
    expect(() => queryStringToBuilderQuery('a:""')).toThrow();
  });
});
