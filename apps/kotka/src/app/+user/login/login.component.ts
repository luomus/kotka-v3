import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '@kotka/ui/services';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'kotka-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbAlert],
})
export class LoginComponent implements OnInit {
  errorMsg?: string;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const error: string = params['error'];
      const next: string = params['next'];

      if (next) {
        this.userService.login().subscribe({
          next: (next) => {
            this.router.navigateByUrl(next);
          },
          error: (err) => {
            this.onError(err.status);
          },
        });
      } else if (error) {
        this.onError(parseInt(error, 10));
      } else if (!this.errorMsg) {
        this.router.navigate(['/']);
      }
    });
  }

  private onError(errorStatus: number) {
    this.errorMsg =
      errorStatus === 401
        ? 'Missing access rights to application'
        : 'Unexpected error occurred';
    this.cdr.markForCheck();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }
}
