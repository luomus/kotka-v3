import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';
import { Injectable } from '@angular/core';
import { isEqual } from 'lodash';

export enum RouteReuseStrategyEnum {
  default = 'default',
  urlMatch = 'urlMatch'
}

@Injectable()
export class KotkaRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    const reuseStrategy: RouteReuseStrategyEnum = Object.values(RouteReuseStrategyEnum).includes(curr.data['routeReuseStrategy'])
      ? curr.data['routeReuseStrategy']
      : 'default';

    if (reuseStrategy === RouteReuseStrategyEnum.urlMatch) {
      return isEqual(future.url, curr.url) && super.shouldReuseRoute(future, curr);
    }

    return super.shouldReuseRoute(future, curr);
  }
}
