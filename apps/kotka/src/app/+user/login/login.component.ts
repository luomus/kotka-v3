import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'kotka-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  errorMsg?: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private cdr: ChangeDetectorRef
    ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const error = params['error'];
      const next = params['next'];

      if (next) {
        this.userService.login().subscribe({
          'next': next => {
            this.router.navigate([next]);
          },
          'error': err => {
            this.errorMsg = err.status === 401 ? 'Missing access rights to application' : 'Unexpected error occurred';
            this.cdr.markForCheck();
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {}
            });
          }
        });
      } else if (error) {
        this.errorMsg = error === 401 ? 'Missing access rights to application' : 'Unexpected error occurred';
        this.cdr.markForCheck();
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {}
        });
      }else if (!this.errorMsg) {
        this.router.navigate(['/']);
      }
    });
  }
}
