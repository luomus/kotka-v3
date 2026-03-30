import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { KotkaVersionDifferenceObject, LajiForm, StoreVersion } from '@kotka/shared/models';
import { SpinnerComponent } from '@kotka/ui/components';
import { ViewerComponent } from '@kotka/ui/viewer';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kotka-version-comparison',
  templateUrl: './version-comparison.component.html',
  styleUrls: ['./version-comparison.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SpinnerComponent, ViewerComponent, RouterLink],
})
export class VersionComparisonComponent {
  versions = input<number[] | undefined>(undefined);
  versionList = input<StoreVersion[] | undefined>(undefined);
  form = input<LajiForm.JsonForm | undefined>(undefined);
  data = input<KotkaVersionDifferenceObject | undefined>(undefined);

  fields: Signal<LajiForm.Field[] | undefined>;
  versionData: Signal<StoreVersion[] | undefined>;
  previousVersion: Signal<number | undefined>;
  nextVersion: Signal<number | undefined>;

  private versionIndices: Signal<number[] | undefined>;

  private metaFields: LajiForm.Field[] = [
    {
      name: 'editor',
      label: 'Editor',
      type: 'text',
    },
    {
      name: 'dateEdited',
      label: 'Date edited',
      type: 'text',
    },
    {
      name: 'creator',
      label: 'Creator',
      type: 'text',
    },
    {
      name: 'dateCreated',
      label: 'Date created',
      type: 'text',
    },
  ];

  constructor() {
    this.fields = computed(() => {
      const form = this.form();

      if (form) {
        return [...this.metaFields, ...form.fields];
      }

      return undefined;
    });

    this.versionData = computed(() => {
      const versionList = this.versionList();
      const indices = this.versionIndices();

      if (versionList && indices) {
        return [versionList[indices[0]], versionList[indices[1]]];
      }

      return undefined;
    });

    this.previousVersion = computed(() => {
      const versionList = this.versionList();
      const indices = this.versionIndices();

      if (versionList && indices && indices[0] > 0) {
        return versionList[indices[0] - 1].version;
      }

      return undefined;
    });

    this.nextVersion = computed(() => {
      const versionList = this.versionList();
      const indices = this.versionIndices();

      if (versionList && indices && indices[1] < versionList.length - 1) {
        return versionList[indices[1] + 1].version;
      }

      return undefined;
    });

    this.versionIndices = computed(() => {
      const versions = this.versions();
      const versionList = this.versionList();

      if (versions && versionList) {
        const idx1 = versionList.findIndex(
          (val) => val.version === versions[0],
        );
        const idx2 = versionList.findIndex(
          (val) => val.version === versions[1],
        );
        return [idx1, idx2];
      }

      return undefined;
    });
  }
}
