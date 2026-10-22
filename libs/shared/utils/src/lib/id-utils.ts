export interface ParsedIdentifierParts {
  prefix?: string,
  id?: string,
  namespace?: string,
  objectID?: string
}

export const defaultDomain = 'http://tun.fi/';
export const domainMap: Record<string, string> = {
  'tun:': defaultDomain,
  'luomus:': 'http://id.luomus.fi/',
  'zmuo:': 'http://id.zmuo.oulu.fi/',
  'herbo:': 'http://id.herb.oulu.fi/',
  'utu:': 'http://mus.utu.fi/',
  'gbif-dataset:': 'https://www.gbif.org/dataset/',
};
export const idPrefixMap: Record<string, string> = {
  'http://tun.fi/': 'tun',
  'http://id.luomus.fi/': 'luomus',
  'http://id.zmuo.oulu.fi/': 'zmuo',
  'http://id.herb.oulu.fi/': 'herbo',
  'http://mus.utu.fi/': 'utu',
  'https://www.gbif.org/dataset/': 'gbif-dataset',
};
export const defaultPrefix = 'tun';
export const acceptedPrefixes = ['luomus', 'zmuo', 'herbo', 'utu', 'gbif-dataset', 'tun'];
export type QnamePrefix = 'luomus' | 'zmuo' | 'herbo' | 'utu' | 'gbif-dataset' | 'tun'

export function getId(value: string): string {
  if (typeof value !== 'string' || value === '') return value;

  if (value.indexOf(defaultDomain) === 0) {
    return value.replace(defaultDomain, '');
  } else if (value.indexOf('http') === 0) {
    Object.keys(domainMap).map(key => {
      value = value.replace(domainMap[key], key);
    });
  }

  return value;
}

export function getUri(value: string): string {
  if (typeof value !== 'string' || value === '' || value.indexOf('http') === 0) return value;

  if (value.includes(':')) {
    Object.keys(domainMap).map(key => {
      value = value.replace(key, domainMap[key]);
    });
  }

  if (value.indexOf('http') === 0) return value;

  return defaultDomain + value;
}

export function getDomainAndId(value: string): string[] {
  if (value === '') return ['', value];

  if (value.includes('/')) {
    const lastSlashIndex = value.lastIndexOf('/');
    const domain = value.substring(0, lastSlashIndex + 1);
    if (!idPrefixMap[domain]) {
      return ['', value];
    }
    const id = value.substring(lastSlashIndex + 1);
    return [domain, id];
  } else if (value.includes(':')) {
    const [prefix, id] = value.split(':');
    const domain = domainMap[prefix + ':'];
    if (!domain) {
      return ['', value];
    }
    return [domain, id];
  }

  return [defaultDomain, value];
}

export function getPrefixAndId(value: string): string[] {
  if (typeof value !== 'string' || value === '') return ['', value];

  if (value.includes(':')) {
    const [prefix, id] = value.split(':');
    return [prefix, id];
  }

  return [defaultPrefix, value];
}

export function getIdWithoutPrefix(value: string): string {
  if (typeof value !== 'string' || value === '') return value;

  const idx = value.indexOf(':');
  if (idx !== -1) {
    return value.substring(idx + 1);
  }

  return value;
}

export function parseAndValidateIdentifierParts(value: string, defaultToObjectID = false): ParsedIdentifierParts {
  if (!value) {
    return {};
  }

  let result: ParsedIdentifierParts;

  if (value.includes('/')) {
    const lastSlashIndex = value.lastIndexOf('/');
    const domain = value.substring(0, lastSlashIndex + 1);
    const id = value.substring(lastSlashIndex + 1);

    if (!idPrefixMap[domain]) {
      throw new Error(`Invalid domain: ${domain}`);
    }
    const prefix = idPrefixMap[domain];

    result = { prefix, ...parseIdPart(id, defaultToObjectID) };
  } else if (value.includes(':')) {
    const firstColonIndex = value.indexOf(':');
    const prefix = value.substring(0, firstColonIndex);
    const id = value.substring(firstColonIndex + 1);

    result = { prefix, ...parseIdPart(id, defaultToObjectID) };
  } else {
    result = parseIdPart(value, defaultToObjectID);
  }

  validateIdParts(result);

  return result;
}

function parseIdPart(id: string, defaultToObjectID: boolean): Pick<ParsedIdentifierParts, 'id'|'namespace'|'objectID'> {
  const firstDotIndex = id.indexOf('.');
  if (firstDotIndex !== -1) {
    const namespace = id.substring(0, firstDotIndex);
    const objectID = id.substring(firstDotIndex + 1);

    const result: Pick<ParsedIdentifierParts, 'id'|'namespace'|'objectID'> = { };
    if (namespace) {
      result.namespace = namespace;
    }
    if (objectID) {
      result.objectID = objectID;
    }
    if (namespace && objectID) {
      result.id = id;
    }
    return result;
  }

  if (defaultToObjectID) {
    return { objectID: id };
  }

  return { namespace: id };
}

function validateIdParts(idParts: ParsedIdentifierParts) {
  if (idParts.prefix && !acceptedPrefixes.includes(idParts.prefix)) {
    throw new Error(`Invalid domain: ${idParts.prefix}`);
  }
  if (idParts.namespace && !/^[a-zA-Z0-9-]+$/.test(idParts.namespace)) {
    throw new Error(`Invalid namespace: ${idParts.namespace}`);
  }
  if (idParts.objectID && !/^[a-zA-Z0-9-]+$/.test(idParts.objectID)) {
    throw new Error(`Invalid objectID: ${idParts.objectID}`);
  }
}
