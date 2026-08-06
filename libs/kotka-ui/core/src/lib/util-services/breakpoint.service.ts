import { DOCUMENT, inject, Injectable } from '@angular/core';
import { WINDOW } from '../variables';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type BreakPoint = 'xs'|'sm'|'md'|'lg'|'xl';

type BreakPointState = Partial<{
  [key in BreakPoint]: boolean;
}>;

@Injectable({
  providedIn: 'root',
})
export class BreakpointService {
  private window = inject(WINDOW);
  private document = inject<Document>(DOCUMENT);
  private breakpointObserver = inject(BreakpointObserver);

  getBreakpointState$(breakpoints: BreakPoint[]): Observable<BreakPointState> {
    const rules = breakpoints.map(breakpoint => this.getBreakpointRule(breakpoint));

    return this.breakpointObserver.observe(rules).pipe(
      map(state => {
        const result: BreakPointState = {};
        breakpoints.forEach((breakpoint, i) => {
          result[breakpoint] = state.breakpoints[rules[i]];
        });
        return result;
      })
    );
  }

  private getBreakpointRule(breakpoint: BreakPoint): string {
    const propertyName = `--kotka-breakpoint-${breakpoint}`;

    const bodyStyles = this.window.getComputedStyle(this.document.body);
    const breakpointPx = bodyStyles.getPropertyValue(propertyName);
    if (!breakpointPx) {
      throw new Error(`Css property ${propertyName} not found`);
    }

    return `(min-width: ${breakpointPx})`;
  }
}
