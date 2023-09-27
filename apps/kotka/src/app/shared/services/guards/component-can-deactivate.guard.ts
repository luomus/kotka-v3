import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({providedIn: 'root'})
export class ComponentCanDeactivateGuard implements CanDeactivate<ComponentCanDeactivate> {

  canDeactivate(component: ComponentCanDeactivate): Observable<boolean> | Promise<boolean> | boolean {
    return component.canDeactivate();
  }
}
