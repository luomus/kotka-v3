import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CanActivate } from '@angular/router';

import { UserService } from './user.service';
import { take, tap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class OnlyLoggedIn implements CanActivate {

  constructor(
    private userService: UserService
  ) { }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.userService.isLoggedIn$.pipe(
      take(1),
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          this.userService.redirectToLogin();
        }
      })
    );
  }

}
