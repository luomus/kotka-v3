import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { UserService } from '@kotka/ui/data-services';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { OldKotkaUrlPipe } from '../../pipes/old-kotka-url.pipe';
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
  isCollapsed = true;
  currentPath = '';

  constructor(
    router: Router,
    public userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentPath = event.url;
        this.cdr.markForCheck();
      }
    });
  }
}
