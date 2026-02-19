import { Component, inject } from '@angular/core';
import {
  LabelDesignerComponent,
  genericLabel,
  botanical,
  fungi,
  insectaDet,
  vertebrate,
  SpecimenLabelDesignerService,
} from '@kotka/ui/label-designer';
import { globals } from '../../../environments/globals';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '@kotka/ui/services';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { SpinnerComponent } from '@kotka/ui/spinner';

@Component({
  selector: 'kotka-generic-label-designer',
  template: `
    @if (allFields | async; as allFields) {
      <kui-label-designer
        [defaultAvailableFields]="allFields"
        [setupStorageKey]="setupStorageKey()"
        [columnMapStorageKey]="colMapStorageKey()"
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
  imports: [LabelDesignerComponent, AsyncPipe, SpinnerComponent],
  standalone: true,
})
export class GenericLabelDesignerComponent {
  private userService = inject(UserService);
  private labelDesignerService = inject(SpecimenLabelDesignerService);

  allFields = this.labelDesignerService.getAllFields(globals.specimenFormId);

  setupStorageKey = toSignal(
    this.userService
      .getCurrentLoggedInUser()
      .pipe(map((user) => `ld-generic-setup-${user.id}`)),
  );
  colMapStorageKey = toSignal(
    this.userService
      .getCurrentLoggedInUser()
      .pipe(map((user) => `ld-col-map-${user.id}`)),
  );

  templates = [genericLabel, fungi, insectaDet, vertebrate, botanical];
}
