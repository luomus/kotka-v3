import { NavigationEnd, Router, UrlMatchResult, UrlSegment } from '@angular/router';
import { concat, Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export function formMatcher(segments: UrlSegment[]): UrlMatchResult|null {
  if (segments.length === 1 && ['add', 'edit'].includes(segments[0].path)) {
    return {
      consumed: segments,
      posParams: {}
    };
  }
  return null;
}

export function navigationEnd$(router: Router): Observable<void> {
  return router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => undefined)
  );
}

export function startWithUndefined<T>(observable: Observable<T>): Observable<T|undefined> {
  return concat(of(undefined), observable);
}

export function isKeyOfObject<T extends object>(key: string | number | symbol, obj: T): key is keyof T {
  return key in obj;
}

export function getEnumValue(value: string | undefined, field: any, fieldType: 'json'|'schema' = 'json'): string {
  const valueOptions = fieldType === 'schema' ? getValueOptionsFromSchemaField(field) : field.options?.value_options;
  return valueOptions?.[value || ''] || '';
}

function getValueOptionsFromSchemaField(schemaField: any): Record<string, string> {
  const value_options: Record<string, string> = { '' : '' };

  schemaField.oneOf?.forEach((value: { const: string; title: string }) => {
    value_options[value.const] = value.title;
  });

  return value_options;
}
