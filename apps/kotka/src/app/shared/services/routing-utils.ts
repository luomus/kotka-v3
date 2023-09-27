import { UrlMatchResult, UrlSegment } from '@angular/router';

export class RoutingUtils {
  static formMatcher(segments: UrlSegment[]): UrlMatchResult|null {
    if (segments.length === 1 && ['add', 'edit'].includes(segments[0].path)) {
      return {
        consumed: segments,
        posParams: {}
      };
    }
    return null;
  };
}
