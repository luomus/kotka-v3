import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StatusService } from './status.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'kotka-status',
  template: `
    <div>
      Status: {{ status$ | async }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe]
})
export class StatusComponent {
  status$: Observable<string>;

  constructor(
    statusService: StatusService
  ) {
    this.status$ = statusService.getApiStatus().pipe(
      map(status => status.status)
    );
  }
}
