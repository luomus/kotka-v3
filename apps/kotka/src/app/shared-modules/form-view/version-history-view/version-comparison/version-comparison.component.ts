import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges
} from '@angular/core';
import { LajiForm } from '@kotka/shared/models';
import { VersionDifference } from '../../../../shared/services/api-services/data.service';
import { StoreVersion } from '@kotka/api-interfaces';

@Component({
  selector: 'kotka-version-comparison',
  templateUrl: './version-comparison.component.html',
  styleUrls: ['./version-comparison.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionComparisonComponent implements OnChanges {
  @Input() versions?: string[];
  @Input() versionList?: StoreVersion[];

  @Input() form?: LajiForm.JsonForm;
  @Input() data?: VersionDifference;

  versionData?: StoreVersion[];
  previousVersion?: number;
  nextVersion?: number;

  ngOnChanges() {
    if (this.versions && this.versionList?.length) {
      const version1 = parseInt(this.versions[0], 10);
      const version2 = parseInt(this.versions[1], 10);
      const idx1 = this.versionList.findIndex(val => val.version === version1);
      const idx2 = this.versionList.findIndex(val => val.version === version2);

      this.previousVersion = idx1 > 0 ? this.versionList[idx1 - 1].version : undefined;
      this.nextVersion = idx2 !== this.versionList.length - 1 ? this.versionList[idx2 + 1].version : undefined;

      this.versionData = [this.versionList[idx1], this.versionList[idx2]];
    }
  }
}
