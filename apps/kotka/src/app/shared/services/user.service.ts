import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, switchMap, isObservable } from 'rxjs';
import { map, tap, distinctUntilChanged, share } from 'rxjs/operators';
import { WINDOW } from '@ng-toolkit/universal';
import { Person } from '../../../../../../libs/shared/models/src';

export interface IUserServiceState {
  user: Person | null;
  isLoggedIn: boolean | null;
  allUsers: Record<string, Person|Observable<Person>>;
}

const authPath = '/api/auth/';
const personPath = '/api/laji/person/by-id/';

let _state: IUserServiceState = {
  user: null,
  isLoggedIn: null,
  allUsers: {}
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
    return this.httpClient.get<Person>(authPath + 'user').pipe(
      tap(user => this.updateUser(user)),
      catchError(() => {
        this.updateUser(null);
        return of(null);
      })
    );
  }

  login(token: string) {
    return this.httpClient.post<Person>(authPath + 'login', { token }).pipe(
      tap(user => this.updateUser(user)),
    );
  }

  logout() {
    return this.httpClient.get(authPath + 'logout').pipe(
      tap(() => this.updateUser(null)),
    );
  }

  getPersonInfo(id: string, info: 'fullName' = 'fullName'): Observable<string> {
    if (!id || !id.startsWith('MA.')) {
      return of(id);
    }

    const pickValue = (obs: Observable<Person>): Observable<string> => obs.pipe(
      map(person => person[info] ?? ''
      )
    );

    if (_state.allUsers[id]) {
      return pickValue(
        isObservable(_state.allUsers[id]) ?
          _state.allUsers[id] as Observable<Person> :
          of(_state.allUsers[id] as Person)
      );
    }
    if (_state.user && id === _state.user.id) {
      return pickValue(of(_state.user));
    }

    _state.allUsers[id] = this.httpClient.get<Person>(personPath + id).pipe(
      tap({
          next: person => _state.allUsers[id] = person as Person,
          error: () => delete _state.allUsers[id]
      }),
      catchError(() => of({
        id,
        fullName: id,
        emailAddress: id
      })),
      share()
    );

    return pickValue(_state.allUsers[id] as Observable<Person>);
  }

  private updateUser(user: Person | null) {
    this.updateState({..._state, user, isLoggedIn: !!user});
  }

  private updateState(state: IUserServiceState) {
    this.store.next(_state = state);
  }

  redirectToLogin(): void {
    this.window.location.href = authPath + 'login';
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
