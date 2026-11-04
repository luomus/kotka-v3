import {
  ChangeDetectionStrategy,
  Component, input,
  model,
  output,
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

  enterSubmit = output<void>();

  onEnter(event: Event) {
    if (event instanceof KeyboardEvent && event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.enterSubmit.emit();
  }
}
