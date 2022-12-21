import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'kotka-nav',
  templateUrl: './nav.component.html',
  styles: [
    `
      :host {
        display: block;
      }
      .nav-link {
        cursor: pointer;
        padding: 0.7rem 1rem;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavComponent {
  isCollapsed = true;
  currentPath = '';

  constructor (
    router: Router,
    public userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd ) {
        this.currentPath = event.url;
        this.cdr.markForCheck();
      }
    });
  }
}
