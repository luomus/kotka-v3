import { Injectable, inject, signal, computed } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { map, tap, distinctUntilChanged, share } from 'rxjs/operators';
import { Person } from '@kotka/shared/models';
import { apiBase } from './constants';
import { ApiClient } from './api-client';
import { WINDOW } from '../variables';
import { toObservable } from '@angular/core/rxjs-interop';

export interface LoginState {
  user: Person | null;
  isLoggedIn: boolean | null;
}

const authPath = `${apiBase}/auth/`;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private window = inject(WINDOW);
  private apiClient = inject(ApiClient);

  private state = signal<LoginState>({
    user: null,
    isLoggedIn: null,
  });

  user = computed(() => this.state().user);

  isLoggedIn$: Observable<boolean>;

  constructor() {
    const profile$ = this.getSessionProfile().pipe(share());

    this.isLoggedIn$ = toObservable(this.state).pipe(
      map((state) => state.isLoggedIn),
      switchMap((isLoggedIn) => {
        if (isLoggedIn === null) {
          return profile$.pipe(switchMap(() => this.isLoggedIn$));
        } else {
          return of(isLoggedIn);
        }
      }),
      distinctUntilChanged(),
    );
  }

  login(): Observable<string> {
    return this.apiClient.login().pipe(
      tap((data) => this.updateUser(data.profile)),
      map((data) => data.next),
    );
  }

  logout() {
    return this.apiClient.logout().pipe(tap(() => this.updateUser(null)));
  }

  redirectToLogin(next = ''): void {
    this.window.location.href = `${authPath}login?next=${next}`;
  }

  formatUserName(fullName?: string) {
    if (!fullName) {
      return '';
    }

    const splitIdx = fullName.indexOf(' ');
    const firstName = fullName.substring(0, splitIdx);
    const lastName = fullName.substring(splitIdx + 1);
    return lastName + ', ' + firstName;
  }

  private getSessionProfile(): Observable<Person | null> {
    return this.apiClient.getSessionProfile().pipe(
      catchError(() => {
        return of(null);
      }),
      tap((user) => this.updateUser(user)),
    );
  }

  private updateUser(user: Person | null) {
    this.state.set({ ...this.state(), user, isLoggedIn: !!user });
  }
}
