import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@kotka/ui/core';
import { environment } from '../../../environments/environment';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'kotka-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbAlert],
})
export class LogoutComponent implements OnInit {
  errorMsg?: string;

  private router = inject(Router);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.userService.logout().subscribe({
      next: () => {
        if (environment.oldKotkaUrl) {
          window.location.href =
            environment.oldKotkaUrl +
            '/user/logout?next=' +
            environment.oldKotkaUrl;
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.errorMsg = 'An unexpected error occurred';
        this.cdr.markForCheck();
      },
    });
  }
}
