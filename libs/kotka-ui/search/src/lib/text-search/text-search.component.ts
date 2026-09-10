import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { DatatableColumn } from '@kotka/ui/datatable';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'kui-text-search',
  imports: [FormsModule],
  templateUrl: './text-search.component.html',
  styleUrl: './text-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextSearchComponent {
  columns = input<DatatableColumn[]>([]);

  text = model<string>('');
}
