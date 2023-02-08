import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StatusService } from './status.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kotka-status',
  template: `
    <div>
      Status: {{ status$ | async }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusComponent {
  status$: Observable<string>;

  constructor(
    private statusService: StatusService
  ) {
    this.status$ = statusService.getApiStatus().pipe(
      map(status => status.status)
    );
  }
}
