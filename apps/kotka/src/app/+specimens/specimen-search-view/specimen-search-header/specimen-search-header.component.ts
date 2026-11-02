import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Logger, ToastService, WINDOW } from '@kotka/ui/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'kotka-specimen-search-header',
  templateUrl: './specimen-search-header.component.html',
  styleUrls: ['./specimen-search-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule
  ],
})
export class SpecimenSearchHeaderComponent {
  private window = inject(WINDOW);
  private toastService = inject(ToastService);
  private logger = inject(Logger);

  searchLink = input.required<string>();

  copySearchLinkToClipboard() {
    const searchLink = this.searchLink();
    this.window.navigator.clipboard.writeText(searchLink).then(
      () => {
        this.toastService.showSuccess('Search link copied to clipboard');
      },
      (err) => {
        this.logger.error('Failed to copy search link to clipboard', err);
        this.toastService.showError('Failed to copy search link to clipboard');
      },
    );
  }
}
