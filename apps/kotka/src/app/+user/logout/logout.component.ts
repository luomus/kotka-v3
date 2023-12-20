import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@kotka/services';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'kotka-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent implements OnInit {
  errorMsg?: string;

  constructor(
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.userService.logout().subscribe({
      'next': () => {
        if (environment.oldKotkaUrl) {
          window.location.href = environment.oldKotkaUrl + '/user/logout?next=' + environment.oldKotkaUrl;
        } else {
          this.router.navigate(['/']);
        }
      },
      'error': () => {
        this.errorMsg = 'An unexpected error occurred';
        this.cdr.markForCheck();
      }
    });
  }

}
