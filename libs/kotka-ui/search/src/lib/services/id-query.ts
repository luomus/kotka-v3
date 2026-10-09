import { ParsedIdentifierParts, parseAndValidateIdentifierParts } from '@kotka/shared/utils';
import { BuilderQuery, SearchCriteria, SearchGroup } from '../models';
import { ElasticDocument } from '@kotka/shared/models';

interface IdSearchCriteria extends SearchCriteria {
  field: keyof Pick<ElasticDocument, 'domain' | 'namespace' | 'objectID' | 'documentID'>;
}

export function parseIdQuery(idQuery: string): BuilderQuery {
  const terms = idQuery.trim().split(/(?:\s|,)+/);

  const groups: SearchGroup[] = terms.map(term => {
    if (term.includes('..')) {
      const lastIndex = term.lastIndexOf('..');
      const startPart = term.substring(0, lastIndex);
      const end = term.substring(lastIndex + 2);

      try {
        const idParts = parseAndValidateIdentifierParts(startPart, true);
        return rangeToSearchGroup(idParts, end);
      } catch (e) {
        throw new Error(`Invalid range "${term}".`);
      }
    } else {
      try {
        const idParts = parseAndValidateIdentifierParts(term);
        return identifierToSearchGroup(idParts);
      } catch (e) {
        throw new Error(`Invalid identifier "${term}".`);
      }
    }
  });

  return {
    groups,
    joinOperator: 'OR'
  };
}

function rangeToSearchGroup(idParts: ParsedIdentifierParts, end?: string): SearchGroup {
  let start = idParts.objectID;
  if (
    (!start && !end) ||
    (start && !/[0-9]/.test(start)) ||
    (end && !/[0-9]/.test(end))
  ) {
    throw new Error('Invalid range: start and end must be numeric');
  }

  const criteria: IdSearchCriteria[] = [];
  if (idParts.domain) {
    criteria.push({
      field: 'domain',
      operator: 'equals',
      value: idParts.domain
    });
  }
  if (idParts.namespace) {
    criteria.push({
      field: 'namespace',
      operator: 'equals',
      value: idParts.namespace
    });
  }
  if (start && !end) {
    criteria.push({
      field: 'objectID',
      operator: 'greaterThanOrEqual',
      value: start
    });
  } else if (!start && end) {
    criteria.push({
      field: 'objectID',
      operator: 'lessThanOrEqual',
      value: end
    });
  } else if (start && end) {
    if (start.localeCompare(end, undefined, { numeric: true }) > 0) {
      const oldStart = start;
      start = end;
      end = oldStart;
    }
    criteria.push({
      field: 'objectID',
      operator: 'inRange',
      value: start,
      value2: end
    });
  }

  return {
    criteria,
    joinOperator: 'AND',
  };
}

function identifierToSearchGroup(idParts: ParsedIdentifierParts): SearchGroup {
  const criteria: IdSearchCriteria[] = [];
  if (idParts.domain) {
    criteria.push({
      field: 'domain',
      operator: 'equals',
      value: idParts.domain
    });
  }
  if (idParts.id) {
    criteria.push({
      field: 'documentID',
      operator: 'equals',
      value: idParts.id
    });
  } else if (idParts.namespace) {
    criteria.push({
      field: 'namespace',
      operator: 'equals',
      value: idParts.namespace
    });
  } else if (idParts.objectID) {
    criteria.push({
      field: 'objectID',
      operator: 'equals',
      value: idParts.objectID
    });
  }

  return {
    criteria,
    joinOperator: 'AND'
  };
}
