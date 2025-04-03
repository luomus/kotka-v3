import { Injectable } from '@angular/core';
import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {
  catchError,
  Observable,
  of,
  Subject,
  throttleTime,
  throwError,
} from 'rxjs';
import { UserService } from '../data-services';
import { Router } from '@angular/router';
import { ErrorMessages } from '@kotka/shared/models';

export const LOGIN_REDIRECT_ENABLED = new HttpContextToken<boolean>(() => true);

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private needsRedirect$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private router: Router,
  ) {
    this.needsRedirect$.pipe(throttleTime(5000)).subscribe(() => {
      this.userService.redirectToLogin(this.router.url);
    });
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (
          request.context.get(LOGIN_REDIRECT_ENABLED) &&
          err.status === 401 &&
          err.error?.message === ErrorMessages.loginRequired
        ) {
          this.needsRedirect$.next();
          return of();
        }
        return throwError(() => err);
      }),
    );
  }
}
