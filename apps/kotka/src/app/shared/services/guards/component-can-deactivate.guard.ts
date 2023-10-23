import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

export const ComponentCanDeactivateGuard: CanDeactivateFn<ComponentCanDeactivate> = (component: ComponentCanDeactivate) => (
    component.canDeactivate()
)
