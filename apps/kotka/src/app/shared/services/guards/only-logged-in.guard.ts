import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
} from '@angular/router';

import { UserService } from '@kotka/ui/data-services';
import { take, tap } from 'rxjs/operators';

export const OnlyLoggedInGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const userService = inject(UserService);
  return userService.isLoggedIn$.pipe(
    take(1),
    tap((isLoggedIn) => {
      if (!isLoggedIn) {
        userService.redirectToLogin(state.url);
      }
    }),
  );
};
