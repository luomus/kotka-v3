import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchField } from '@kotka/shared/models';

@Component({
  selector: 'kui-text-search',
  imports: [FormsModule],
  templateUrl: './text-search.component.html',
  styleUrl: './text-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextSearchComponent {
  columns = input<SearchField[]>([]);

  text = model<string>('');
}
