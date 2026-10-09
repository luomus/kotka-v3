import {
  ChangeDetectionStrategy,
  Component, input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'kui-id-search',
  imports: [FormsModule],
  templateUrl: './id-search.component.html',
  styleUrls: ['./id-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdSearchComponent {
  idSearchText = model<string>('');
  idSearchTextParseError = input<string>('');
}
