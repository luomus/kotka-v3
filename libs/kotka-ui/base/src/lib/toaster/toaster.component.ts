import { ChangeDetectionStrategy, Component, TemplateRef, HostBinding, inject } from '@angular/core';
import { ToastService } from '@kotka/ui/core';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kotka-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgbToast],
})
export class ToasterComponent {
  toastService = inject(ToastService);

  @HostBinding('class') classes =
    'toast-container position-fixed top-0 end-0 p-3';

  asTemplate(
    tpl: TemplateRef<unknown> | string,
  ): TemplateRef<unknown> | undefined {
    return tpl instanceof TemplateRef ? tpl : undefined;
  }
}
