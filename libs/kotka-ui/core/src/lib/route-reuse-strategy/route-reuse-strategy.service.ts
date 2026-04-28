import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  Router,
} from '@angular/router';
import { inject, Injectable, Injector } from '@angular/core';

@Injectable()
export class KotkaRouteReuseStrategy extends BaseRouteReuseStrategy {
  private injector = inject(Injector);

  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    const router = this.injector.get(Router);
    const navigation = router.currentNavigation();

    if (curr.data['forceRouteRefresh']) {
      if (!navigation?.extras.state?.['skipForceRouteRefresh']) {
        return false;
      }
    }

    return super.shouldReuseRoute(future, curr);
  }
}
