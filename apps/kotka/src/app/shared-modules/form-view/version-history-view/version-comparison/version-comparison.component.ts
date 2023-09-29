import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { LajiForm } from '@kotka/shared/models';
import { StoreVersionDifference } from '@kotka/api-interfaces';

@Component({
  selector: 'kotka-version-comparison',
  templateUrl: './version-comparison.component.html',
  styleUrls: ['./version-comparison.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionComparisonComponent{
  @Input() form?: LajiForm.JsonForm;
  @Input() data?: StoreVersionDifference;
}
