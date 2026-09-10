import { getParsedTerms } from './query-parse-terms';

describe('Valid texts without group', () => {
  it('parses a simple field and value pair', () => {
    expect(getParsedTerms('field:value')).toEqual([
      { type: 'field', value: 'field' },
      { type: 'value', value: 'value' },
    ]);
  });

  it('parses a simple field and value pair with additional whitespace', () => {
    expect(getParsedTerms('field: value')).toEqual([
      { type: 'field', value: 'field' },
      { type: 'value', value: 'value' },
    ]);
  });

  it('parses operators between terms', () => {
    expect(getParsedTerms('a:1 AND b:2')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '1' },
      { type: 'joinOperator', value: 'AND' },
      { type: 'field', value: 'b' },
      { type: 'value', value: '2' },
    ]);
  });

  it('parses operators between terms without space', () => {
    expect(getParsedTerms('a:"1"AND b:2')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '1', valueType: 'exact' },
      { type: 'joinOperator', value: 'AND' },
      { type: 'field', value: 'b' },
      { type: 'value', value: '2' },
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
      { type: 'value', value: '1' }
    ]);
  });

  it('accepts escape characters in operators', () => {
    expect(getParsedTerms('a:1 A\\ND b:2')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '1' },
      { type: 'joinOperator', value: 'AND' },
      { type: 'field', value: 'b' },
      { type: 'value', value: '2' }
    ]);
  });

  it('accepts escape characters in field names', () => {
    expect(getParsedTerms('a\\b:1')).toEqual([
      { type: 'field', value: 'ab' },
      { type: 'value', value: '1' }
    ]);
  });

  it('accepts escape characters in values', () => {
    expect(getParsedTerms('a:*1\\*b')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'value', value: '1*b', valueType: 'endsWith' },
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
          { type: 'value', value: '1' },
          { type: 'joinOperator', value: 'OR' },
          { type: 'field', value: 'a' },
          { type: 'value', value: '2' },
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
          { type: 'value', value: '1' },
        ],
      },
      { type: 'joinOperator', value: 'OR' },
      {
        type: 'group',
        value: [
          { type: 'field', value: 'a' },
          { type: 'value', value: '2' },
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
              { type: 'value', value: '1' },
            ],
          },
          { type: 'joinOperator', value: 'OR' },
          {
            type: 'group',
            value: [
              { type: 'field', value: 'a' },
              { type: 'value', value: '2' },
            ],
          },
        ],
      },
      { type: 'joinOperator', value: 'AND' },
      { type: 'field', value: 'c' },
      { type: 'value', value: '3' },
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
});
