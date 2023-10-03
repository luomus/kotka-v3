import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

@Component({
  selector: 'kotka-version-list',
  templateUrl: './version-list.component.html',
  styleUrls: ['./version-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionListComponent {

}
