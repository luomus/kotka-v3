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
