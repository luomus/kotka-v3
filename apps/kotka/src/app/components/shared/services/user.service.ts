import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import {map, tap, distinctUntilChanged} from 'rxjs/operators'
export interface IUserServiceState {
  user: any | null;
}

const path = '/api/auth/'
let _state: IUserServiceState = {
  user: null,
};

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private store = new ReplaySubject<IUserServiceState>(1);
  private state$ = this.store.asObservable();
  
  user$ = this.state$.pipe(map((state) => state.user), distinctUntilChanged());

  constructor(
    private httpClient: HttpClient
  ) {
  }

  getSessionProfile() {
    return this.httpClient.get(path + 'user').pipe(
      tap(user => this.updateState({ user }))
    )
  }

  login(token: any) {
    return this.httpClient.post(path + 'login', { token }).pipe(
      tap(user => this.updateState({ user })),
    )
  }

  logout() {
    return this.httpClient.get(path + 'logout').pipe(
      tap(() => this.updateState({ user: null })),
    )
  }

  private updateState(state: IUserServiceState) {
    this.store.next(_state = state);
  }
}
