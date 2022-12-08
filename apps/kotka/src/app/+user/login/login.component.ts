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
      const token = params['token'];
      if (token) {
        this.userService.login(token).subscribe({
          'next': () => {
            this.router.navigate(['/']);
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
      } else if (!this.errorMsg) {
        this.router.navigate(['/']);
      }
    });
  }

}
