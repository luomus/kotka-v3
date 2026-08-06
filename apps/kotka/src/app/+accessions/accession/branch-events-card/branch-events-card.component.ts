import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { Branch } from '@luomus/laji-schema';

@Component({
  selector: 'kotka-branch-events-card',
  templateUrl: './branch-events-card.component.html',
  styleUrls: ['./branch-events-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class BranchEventsCardComponent {
  branch = input.required<Branch>();
}
