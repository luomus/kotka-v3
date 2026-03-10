import { JSONPath } from 'jsonpath-plus';

export interface JSONPathAllResponse {
  value: any;
  path: string;
  pointer: string;
  parent: any;
  parentProperty: string;
}

export function parseJSONPointer(data: object, path: string) {
  return JSONPath({ path: path.split('/'), json: data || {}, wrap: false });
}

export function parseStoreSearchPath(path: string) {
  let storeSearchPath = '';

  if (path.startsWith('/')) path = path.slice(1);

  const splitPath = path.split('/');

  splitPath.forEach((part, idx) => {
    if(!/^\d+$/.test(part)) {
      storeSearchPath += (idx === 0 ? part : '.' + part);
    }
  });

  return storeSearchPath;
}
