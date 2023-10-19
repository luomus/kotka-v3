import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges
} from '@angular/core';
import { KotkaVersionDifferenceObject, LajiForm, StoreVersion } from '@kotka/shared/models';

@Component({
  selector: 'kotka-version-comparison',
  templateUrl: './version-comparison.component.html',
  styleUrls: ['./version-comparison.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionComparisonComponent implements OnChanges {
  @Input() versions?: number[];
  @Input() versionList?: StoreVersion[];

  @Input() form?: LajiForm.JsonForm;
  @Input() data?: KotkaVersionDifferenceObject;

  versionData?: StoreVersion[];
  previousVersion?: number;
  nextVersion?: number;

  ngOnChanges() {
    if (this.versions && this.versionList) {
      const idx1 = this.versionList.findIndex(val => val.version === this.versions?.[0]);
      const idx2 = this.versionList.findIndex(val => val.version === this.versions?.[1]);

      this.previousVersion = idx1 > 0 ? this.versionList[idx1 - 1].version : undefined;
      this.nextVersion = idx2 !== this.versionList.length - 1 ? this.versionList[idx2 + 1].version : undefined;

      this.versionData = [this.versionList[idx1], this.versionList[idx2]];
    }
  }
}
