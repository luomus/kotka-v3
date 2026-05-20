import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface UserUsageEntry {
  user: string;
  count: number;
}

@Component({
  selector: 'kotka-usage-table',
  templateUrl: './usage-table.component.html',
  styleUrls: ['./usage-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsageTableComponent {
  title = input.required<string>();
  entries = input.required<UserUsageEntry[]>();
}

