import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { UserService, OldKotkaUrlPipe } from '@kotka/ui/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import {
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kotka-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgbCollapseModule,
    NgbDropdownModule,
    OldKotkaUrlPipe,
    RouterLink,
    RouterLinkActive,
  ],
})
export class NavComponent {
  userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  isCollapsed = true;
  currentPath = '';

  constructor() {
    const router = inject(Router);

    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentPath = event.url;
        this.cdr.markForCheck();
      }
    });
  }
}
