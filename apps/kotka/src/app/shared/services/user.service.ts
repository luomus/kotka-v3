import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, switchMap } from 'rxjs';
import { map, tap, distinctUntilChanged, share } from 'rxjs/operators';
import { WINDOW } from '@ng-toolkit/universal';
import { Person } from '@kotka/shared/models';
import { LoginResponse } from '@kotka/api-interfaces';

export interface IUserServiceState {
  user: Person | null;
  isLoggedIn: boolean | null;
}

const authPath = '/api/auth/';

let _state: IUserServiceState = {
  user: null,
  isLoggedIn: null
};

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private store = new BehaviorSubject<IUserServiceState>(_state);
  private state$ = this.store.asObservable();

  user$ = this.state$.pipe(map((state) => state.user), distinctUntilChanged());
  isLoggedIn$: Observable<boolean>;

  constructor(
    @Inject(WINDOW) private window: Window,
    private httpClient: HttpClient
  ) {
    const profile$ = this.getSessionProfile().pipe(share());

    this.isLoggedIn$ = this.state$.pipe(
      map(state => state.isLoggedIn),
      switchMap(isLoggedIn => {
        if (isLoggedIn === null) {
          return profile$.pipe(
            switchMap(() => this.isLoggedIn$)
          );
        } else {
          return of(isLoggedIn);
        }
      }),
      distinctUntilChanged()
    );
  }

  private getSessionProfile(): Observable<Person | null> {
    return this.httpClient.get<Person>(authPath + 'user').pipe(
      catchError(() => {
        return of(null);
      }),
      tap(user => this.updateUser(user))
    );
  }

  login(): Observable<string> {
    return this.httpClient.get<LoginResponse>(authPath + 'postLogin').pipe(
      tap(data => this.updateUser(data.profile)),
      map(data => data.next)
    );
  }

  logout() {
    return this.httpClient.get(authPath + 'logout').pipe(
      tap(() => this.updateUser(null)),
    );
  }

  private updateUser(user: Person | null) {
    this.updateState({..._state, user, isLoggedIn: !!user});
  }

  private updateState(state: IUserServiceState) {
    this.store.next(_state = state);
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
}
