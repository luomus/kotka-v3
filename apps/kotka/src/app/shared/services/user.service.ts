import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, switchMap } from 'rxjs';
import { map, tap, distinctUntilChanged, filter, take } from 'rxjs/operators'
import { WINDOW } from '@ng-toolkit/universal';
import { Person } from '../../../../../../libs/shared/models/src';

export interface IUserServiceState {
  user: Person | null;
  isLoggedIn: boolean | null;
}

const path = '/api/auth/'
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
    this.isLoggedIn$ = this.state$.pipe(
      map(state => state.isLoggedIn),
      switchMap(isLoggedIn => {
        if (isLoggedIn === null) {
          return this.getSessionProfile().pipe(
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
    return this.httpClient.get<Person>(path + 'user').pipe(
      tap(user => this.updateUser(user)),
      catchError(() => {
        this.updateUser(null);
        return of(null);
      })
    );
  }

  login(token: string) {
    return this.httpClient.post<Person>(path + 'login', { token }).pipe(
      tap(user => this.updateUser(user)),
    )
  }

  logout() {
    return this.httpClient.get(path + 'logout').pipe(
      tap(() => this.updateUser(null)),
    )
  }

  private updateUser(user: Person | null) {
    this.updateState({user, isLoggedIn: !!user});
  }

  private updateState(state: IUserServiceState) {
    this.store.next(_state = state);
  }

  redirectToLogin(): void {
    this.window.location.href = path + 'login';
  }
}
