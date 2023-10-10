import {
  Component,
  Inject,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { LajiFormEmbedComponent } from '@kotka/ui/laji-form';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'kotka-specimen-range-embed',
  template: `
    <ng-template #template>
      <div class="mb-3">
        Add specimens by a range:
        <div class="row">
          <div class="col-md-6 col-lg-6">
            <div class="input-group">
              <input id="specimenRangeInput" type="text" class="form-control" placeholder="ex: HT.120-300">
              <button id="specimenRangeBtn" class="btn btn-primary text-white">Add</button>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `
})
export class SpecimenRangeSelectEmbedComponent implements LajiFormEmbedComponent {
  specimenRangeClick = new Subject<string>();

  @ViewChild('template', { static: true }) template!: TemplateRef<any>;

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {}

  onTemplateEmbed() {
    this.document.getElementById("specimenRangeBtn")?.addEventListener('click', this.specimenRangeBtnClick.bind(this));
  }

  clearSpecimenRangeInput() {
    const specimenRangeInput = this.document.getElementById("specimenRangeInput") as HTMLInputElement|null;
    if (specimenRangeInput) {
      specimenRangeInput.value = '';
    }
  }

  setDisabled(disabled: boolean) {
    const specimenRangeInput = this.document.getElementById("specimenRangeInput") as HTMLInputElement|null;
    if (specimenRangeInput) {
      specimenRangeInput.disabled = disabled;
    }
    const specimenRangeButton =  this.document.getElementById("specimenRangeBtn")  as HTMLInputElement|null;
    if (specimenRangeButton) {
      specimenRangeButton.disabled = disabled;
    }
  }

  private specimenRangeBtnClick() {
    const specimenRangeInput = this.document.getElementById("specimenRangeInput") as HTMLInputElement|null;
    this.specimenRangeClick.next(specimenRangeInput?.value || '');
  }
}
