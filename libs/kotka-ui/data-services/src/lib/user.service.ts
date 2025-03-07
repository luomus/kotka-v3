import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, switchMap } from 'rxjs';
import { map, tap, distinctUntilChanged, share, take } from 'rxjs/operators';
import { Person } from '@kotka/shared/models';
import { apiBase } from './constants';
import { ApiClient } from './api-client';

export interface IUserServiceState {
  user: Person | null;
  isLoggedIn: boolean | null;
}

const authPath = `${apiBase}/auth/`;

let _state: IUserServiceState = {
  user: null,
  isLoggedIn: null,
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private store = new BehaviorSubject<IUserServiceState>(_state);
  private state$ = this.store.asObservable();

  user$ = this.state$.pipe(
    map((state) => state.user),
    distinctUntilChanged(),
  );
  isLoggedIn$: Observable<boolean>;

  constructor(
    @Inject('Window') private window: Window,
    private apiClient: ApiClient,
  ) {
    const profile$ = this.getSessionProfile().pipe(share());

    this.isLoggedIn$ = this.state$.pipe(
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

  private getSessionProfile(): Observable<Person | null> {
    return this.apiClient.getSessionProfile().pipe(
      catchError(() => {
        return of(null);
      }),
      tap((user) => this.updateUser(user)),
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

  private updateUser(user: Person | null) {
    this.updateState({ ..._state, user, isLoggedIn: !!user });
  }

  private updateState(state: IUserServiceState) {
    this.store.next((_state = state));
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

  isICTAdmin(user: Person): boolean {
    return (user.role || []).includes('MA.admin');
  }

  getCurrentLoggedInUser(): Observable<Person> {
    return this.user$.pipe(
      map((user) => {
        if (!user) {
          throw new Error('Missing user information!');
        }
        return user;
      }),
      take(1),
    );
  }
}
