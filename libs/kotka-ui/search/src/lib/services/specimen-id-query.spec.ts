import { parseIdQuery } from './specimen-id-query';

describe('parseIdQuery', () => {
  it('parses a single id', () => {
    expect(parseIdQuery('HT.1')).toEqual({
      groups: [
        { criteria: [{ field: 'documentID', operator: 'equals', value: 'HT.1' }], joinOperator: 'AND' },
      ],
      joinOperator: 'OR',
    });
  });

  it('parses a comma separated list of ids and ranges', () => {
    expect(parseIdQuery('HT.1,HT.2,HT.3..4')).toEqual({
      groups: [
        { criteria: [{ field: 'documentID', operator: 'equals', value: 'HT.1' }], joinOperator: 'AND' },
        { criteria: [{ field: 'documentID', operator: 'equals', value: 'HT.2' }], joinOperator: 'AND' },
        {
          criteria: [
            { field: 'namespace', operator: 'equals', value: 'HT' },
            { field: 'objectID', operator: 'inRange', value: '3', value2: '4' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'OR',
    });
  });

  it('parses a space separated list of ids and ranges', () => {
    expect(parseIdQuery('HT.1 HT.2 HT.3..4')).toEqual({
      groups: [
        { criteria: [{ field: 'documentID', operator: 'equals', value: 'HT.1' }], joinOperator: 'AND' },
        { criteria: [{ field: 'documentID', operator: 'equals', value: 'HT.2' }], joinOperator: 'AND' },
        {
          criteria: [
            { field: 'namespace', operator: 'equals', value: 'HT' },
            { field: 'objectID', operator: 'inRange', value: '3', value2: '4' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'OR',
    });
  });

  it('ignores extra whitespace', () => {
    expect(parseIdQuery(' HT.1 , HT.2 ')).toEqual({
      groups: [
        { criteria: [{ field: 'documentID', operator: 'equals', value: 'HT.1' }], joinOperator: 'AND' },
        { criteria: [{ field: 'documentID', operator: 'equals', value: 'HT.2' }], joinOperator: 'AND' },
      ],
      joinOperator: 'OR',
    });
  });

  it('parses a domain', () => {
    expect(parseIdQuery('tun:JA.12..23')).toEqual({
      groups: [
        {
          criteria: [
            { field: 'domain', operator: 'equals', value: 'tun' },
            { field: 'namespace', operator: 'equals', value: 'JA' },
            { field: 'objectID', operator: 'inRange', value: '12', value2: '23' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'OR',
    });
  });

  it('parses a full domain', () => {
    expect(parseIdQuery('https://www.gbif.org/dataset/HT.1')).toEqual({
      groups: [
        {
          criteria: [
            { field: 'domain', operator: 'equals', value: 'gbif-dataset' },
            { field: 'documentID', operator: 'equals', value: 'HT.1' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'OR',
    });
  });

  it('parses incomplete range', () => {
    expect(parseIdQuery('tun:JA.12..')).toEqual({
      groups: [
        {
          criteria: [
            { field: 'domain', operator: 'equals', value: 'tun' },
            { field: 'namespace', operator: 'equals', value: 'JA' },
            { field: 'objectID', operator: 'greaterThanOrEqual', value: '12' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'OR',
    });
    expect(parseIdQuery('tun:JA...23')).toEqual({
      groups: [
        {
          criteria: [
            { field: 'domain', operator: 'equals', value: 'tun' },
            { field: 'namespace', operator: 'equals', value: 'JA' },
            { field: 'objectID', operator: 'lessThanOrEqual', value: '23' },
          ],
          joinOperator: 'AND',
        },
      ],
      joinOperator: 'OR',
    });
  });

  it('throws on invalid domain', () => {
    expect(() => parseIdQuery('abc:HT.1')).toThrow();
  });
});
