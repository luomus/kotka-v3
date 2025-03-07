const defaultDomain = 'http://tun.fi/';
const domainMap: Record<string, string> = {
  'luomus:': 'http://id.luomus.fi/',
  'zmuo:': 'http://id.zmuo.oulu.fi/',
  'herbo:': 'http://id.herb.oulu.fi/',
  'utu:': 'http://mus.utu.fi/',
  'gbif-dataset:': 'https://www.gbif.org/dataset/',
};

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

export function getDomainAndIdWithoutPrefix(value: string): string[] {
  if (typeof value !== 'string' || value === '' || value.indexOf('http') === 0) return ['', value];

  if (value.includes(':')) {
    const [prefix, id] = value.split(':');
    const domain = domainMap[prefix] || defaultDomain;
    return [domain, id];
  }

  return [defaultDomain, value];
}

export function getIdWithoutPrefix(value: string): string {
  if (typeof value !== 'string' || value === '') return value;

  const idx = value.indexOf(':');
  if (idx !== -1) {
    return value.substring(idx + 1);
  }

  return value;
}
