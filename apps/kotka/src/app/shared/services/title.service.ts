import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';

const MAIN_TITLE = 'Kotka';

@Injectable({
  providedIn: 'root'
})

export class TitleService {

  constructor(
    private router: Router,
    private titleService: Title
  ) {}

  startRouteListener() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route: ActivatedRoute = this.router.routerState.root;
          let routeTitle = '';
          while (route.firstChild) {
            route = route.firstChild;
          }
          if (route.snapshot.data['title']) {
            routeTitle = route.snapshot.data['title'];
            if (route.snapshot.data['addUriToTitle']) {
              const uri = route.snapshot.queryParams['uri'];
              if (uri) {
                routeTitle += ` ${uri}`;
              }
            }
          }
          return routeTitle;
        })
      )
      .subscribe((title: string) => {
        if (title) {
          this.titleService.setTitle(`${title} - ${MAIN_TITLE}`);
        }
      });
  }
}
