import { Component, computed, inject, input } from '@angular/core';
import {
  botanical,
  fungi,
  insectaDet,
  LabelDesignerComponent,
  SpecimenLabelDesignerService,
  vertebrate,
} from '@kotka/ui/label-designer';
import { globals } from '../../../environments/globals';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '@kotka/ui/services';
import { map } from 'rxjs/operators';
import { SpinnerComponent } from '@kotka/ui/spinner';

@Component({
  selector: 'kotka-specimen-label-designer',
  template: `
    @if (allFields(); as allFields) {
      <kui-label-designer
        [defaultAvailableFields]="allFields"
        [data]="labelData()"
        [setupStorageKey]="setupStorageKey()"
        [templates]="templates"
      />
    } @else {
      <kui-spinner></kui-spinner>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
    }
  `,
  imports: [LabelDesignerComponent, SpinnerComponent],
  standalone: true,
})
export class SpecimenLabelDesignerComponent {
  private userService = inject(UserService);
  private labelDesignerService = inject(SpecimenLabelDesignerService);

  documents = input<any[]>();

  allFields = toSignal(this.labelDesignerService.getAllFields(globals.specimenFormId));

  labelData = computed(() => {
    const fields = this.allFields();
    const docs = this.documents();
    return fields && docs ? this.labelDesignerService.getData(fields, docs) : undefined;
  });

  setupStorageKey = toSignal(
    this.userService
      .getCurrentLoggedInUser()
      .pipe(map((user) => `ld-setup-${user.id}`)),
  );

  templates = [fungi, insectaDet, vertebrate, botanical];
}
