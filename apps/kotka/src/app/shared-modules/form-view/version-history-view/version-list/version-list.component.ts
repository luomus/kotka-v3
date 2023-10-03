import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { StoreVersion } from '@kotka/api-interfaces';

@Component({
  selector: 'kotka-version-list',
  templateUrl: './version-list.component.html',
  styleUrls: ['./version-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionListComponent implements OnChanges {
  @Input() data: StoreVersion[] = [];

  checkedVersions: Record<string, boolean> = {};

  @Output() compareVersionsClick = new EventEmitter<number[]>();

  ngOnChanges() {
    this.checkedVersions = {};
    this.data.forEach(version => {
      this.checkedVersions[version.version] = false;
    });
  }

  onCompareVersionsClick() {
    this.compareVersionsClick.emit(this.getSelectedVersions());
  }

  checkboxClick(e: Event, version: number) {
    const selectedVersions = this.getSelectedVersions();
    if (selectedVersions.length === 2 && !selectedVersions.includes(version)) {
      e.preventDefault();
    } else {
      this.checkedVersions[version] = !this.checkedVersions[version];
    }
  }

  private getSelectedVersions(): number[] {
    return Object.keys(this.checkedVersions).filter(key => this.checkedVersions[key]).map(key => parseInt(key, 10));
  }
}
