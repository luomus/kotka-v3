import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { UserService } from './user.service';
import { take, tap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class OnlyLoggedIn implements CanActivate {

  constructor(
    private userService: UserService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.userService.isLoggedIn$.pipe(
      take(1),
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          this.userService.redirectToLogin(state.url);
        }
      })
    );
  }

}
