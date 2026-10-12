import { getParsedTerms } from './query-parse-terms';

describe('Valid texts without group', () => {
  it('parses a simple field and value pair', () => {
    expect(getParsedTerms('field:value')).toEqual([
      { type: 'field', value: 'field' },
      { type: 'value', value: 'value', valueType: 'equals' },
    ]);
  });

  it('parses a simple field and value pair with additional whitespace', () => {
    expect(getParsedTerms('field: value')).toEqual([
      { type: 'field', value: 'field' },
      { type: 'value', value: 'value', valueType: 'equals' },
    ]);
  });

  it('parses operators between terms', () => {
    expect(getParsedTerms('a:1 AND b:2')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '1', valueType: 'equals' },
      { type: 'joinOperator', value: 'AND' },
      { type: 'field', value: 'b' },
      { type: 'value', value: '2', valueType: 'equals' },
    ]);
  });

  it('parses operators between terms without space', () => {
    expect(getParsedTerms('a:"1"AND b:2')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '1', valueType: 'equals' },
      { type: 'joinOperator', value: 'AND' },
      { type: 'field', value: 'b' },
      { type: 'value', value: '2', valueType: 'equals' },
    ]);
  });

  it('parses value type', () => {
    expect(getParsedTerms('a:*1 AND b:2* AND c:*3*')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '1', valueType: 'endsWith' },
      { type: 'joinOperator', value: 'AND' },
      { type: 'field', value: 'b' },
      { type: 'value', value: '2', valueType: 'startsWith' },
      { type: 'joinOperator', value: 'AND' },
      { type: 'field', value: 'c' },
      { type: 'value', value: '3', valueType: 'contains' }
    ]);
  });


  it('accepts additional parenthesis', () => {
    expect(getParsedTerms('a:(1)')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '1', valueType: 'equals' }
    ]);
  });

  it('accepts additional parenthesis 2', () => {
    expect(getParsedTerms('a:NOT(1)')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'negation', value: 'NOT' },
      { type: 'value', value: '1', valueType: 'equals' }
    ]);
  });

  it('does not accept escape characters in operators', () => {
    expect(getParsedTerms('a:1 A\\ND b:2')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '1', valueType: 'equals' },
      { type: 'value', value: 'AND', valueType: 'equals' },
      { type: 'field', value: 'b' },
      { type: 'value', value: '2', valueType: 'equals' }
    ]);
  });

  it('accepts escape characters in field names', () => {
    expect(getParsedTerms('a\\b:1')).toEqual([
      { type: 'field', value: 'ab' },
      { type: 'value', value: '1', valueType: 'equals' }
    ]);
  });

  it('accepts escape characters in values', () => {
    expect(getParsedTerms('a:*1\\*b')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '1*b', valueType: 'endsWith' },
    ]);
  });

  it('accepts escape characters in values 2', () => {
    expect(getParsedTerms('a:*1b\\*')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '1b*', valueType: 'endsWith' },
    ]);
  });

  it('accepts escape characters in values 3', () => {
    expect(getParsedTerms('a:"a\\"b\\c"')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: 'a"bc', valueType: 'equals' },
    ]);
  });

  it('returns an empty array for an empty string', () => {
    expect(getParsedTerms('')).toEqual([]);
  });
});

describe('Valid texts with group', () => {
  it('parses single group', () => {
    expect(getParsedTerms('(a:1 OR a:2)')).toEqual([
      {
        type: 'group',
        value: [
          { type: 'field', value: 'a' },
          { type: 'value', value: '1', valueType: 'equals' },
          { type: 'joinOperator', value: 'OR' },
          { type: 'field', value: 'a' },
          { type: 'value', value: '2', valueType: 'equals' },
        ],
      },
    ]);
  });

  it('parses multiple simple groups', () => {
    expect(getParsedTerms('(a:1)OR(a:2)')).toEqual([
      {
        type: 'group',
        value: [
          { type: 'field', value: 'a' },
          { type: 'value', value: '1', valueType: 'equals' },
        ],
      },
      { type: 'joinOperator', value: 'OR' },
      {
        type: 'group',
        value: [
          { type: 'field', value: 'a' },
          { type: 'value', value: '2', valueType: 'equals' },
        ],
      },
    ]);
  });

  it('parses nested group', () => {
    expect(getParsedTerms('((a:1)OR(a:2)) AND c:3')).toEqual([
      {
        type: 'group',
        value: [
          {
            type: 'group',
            value: [
              { type: 'field', value: 'a' },
              { type: 'value', value: '1', valueType: 'equals' },
            ],
          },
          { type: 'joinOperator', value: 'OR' },
          {
            type: 'group',
            value: [
              { type: 'field', value: 'a' },
              { type: 'value', value: '2', valueType: 'equals' },
            ],
          },
        ],
      },
      { type: 'joinOperator', value: 'AND' },
      { type: 'field', value: 'c' },
      { type: 'value', value: '3', valueType: 'equals' },
    ]);
  });
});

describe('Valid texts with range', () => {
  it('parses simple range', () => {
    expect(getParsedTerms('a:[0 TO 10]')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '0', value2: '10', valueType: 'inRange' },
    ]);
  });

  it('parses simple date range', () => {
    expect(getParsedTerms('a:[2021-01-01 TO 2021-01-02]')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '2021-01-01', value2: '2021-01-02', valueType: 'inRange' },
    ]);
  });

  it('parses greater than or equal range', () => {
    expect(getParsedTerms('a:[0 TO *]')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '0', valueType: 'greaterThanOrEqual' },
    ]);
  });

  it('parses less than or equal range', () => {
    expect(getParsedTerms('a:[* TO 10]')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '10', valueType: 'lessThanOrEqual' },
    ]);
  });

  it('parses greater than range', () => {
    expect(getParsedTerms('a:{0 TO *}')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '0', valueType: 'greaterThan' },
    ]);
  });

  it('parses less than range', () => {
    expect(getParsedTerms('a:{* TO 10}')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '10', valueType: 'lessThan' },
    ]);
  });
});

describe('Invalid texts', () => {
  it('throws when the field name is missing', () => {
    expect(() => getParsedTerms(':1')).toThrow();
  });

  it('throws when a group is empty', () => {
    expect(() => getParsedTerms('a:()')).toThrow();
  });

  it('throws when the query ends with an escape character', () => {
    expect(() => getParsedTerms('a:1\\')).toThrow();
  });

  it('throws when a group is not closed', () => {
    expect(() => getParsedTerms('(a:1')).toThrow();
  });

  it('throws when an exact value is not closed', () => {
    expect(() => getParsedTerms('a:"1')).toThrow();
  });

  it('throws when a value contains an unescaped special character', () => {
    expect(() => getParsedTerms('a:1)')).toThrow();
  });

  it('throws when contains unsupported range', () => {
    expect(() => getParsedTerms('a:{1 TO 10}')).toThrow();
  });

  it('throws when contains invalid range', () => {
    expect(() => getParsedTerms('a:[1 10]')).toThrow();
  });
});
