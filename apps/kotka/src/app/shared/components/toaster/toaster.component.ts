import { ChangeDetectionStrategy, Component, TemplateRef, HostBinding } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'kotka-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToasterComponent {
  @HostBinding('class') classes = 'toast-container position-fixed top-0 end-0 p-3';

  constructor(
    public toastService: ToastService
  ) {}

  asTemplate(tpl: any): TemplateRef<any>|undefined {
    return tpl instanceof TemplateRef ? tpl : undefined;
  }
}
