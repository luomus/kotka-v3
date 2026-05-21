import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MainContentComponent } from '@kotka/ui/components';
import { UsageTableComponent, UserUsageEntry } from './usage-table/usage-table.component';

@Component({
  selector: 'kotka-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MainContentComponent, UsageTableComponent],
})
export class HomeComponent {
  news = signal<string>('');
  usageTotal = signal<UserUsageEntry[]>([]);
  usageThisYear = signal<UserUsageEntry[]>([]);
  usageThisMonth = signal<UserUsageEntry[]>([]);
}
