import { JSONPath } from 'jsonpath-plus';

export function parseJSONPointer(data: object, path: string) {
  return JSONPath({ path: path.split('/'), json: data || {}, wrap: false });
}
