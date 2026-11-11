import { Component, computed, inject } from '@angular/core';
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
import { UserService } from '@kotka/ui/core';
import { AsyncPipe } from '@angular/common';
import { SpinnerComponent } from '@kotka/ui/components';

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

  setupStorageKey = computed(() =>
    `ld-generic-setup-${this.userService.user()?.id}`
  );
  colMapStorageKey = computed(() =>
    `ld-generic-col-map-${this.userService.user()?.id}`
  );

  templates = [genericLabel, fungi, insectaDet, vertebrate, botanical];
}
