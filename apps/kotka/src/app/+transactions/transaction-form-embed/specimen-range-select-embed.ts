import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'kotka-specimen-range-embed',
  template: `
    <div class="mb-3">
      Add specimens by a range:
      <div class="row">
        <div class="col-md-6 col-lg-6">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="ex: HT.120-300" [(ngModel)]="value" [disabled]="disabled" data-cy="specimen-range-input">
            <button class="btn btn-primary text-white" (click)="specimenRangeClick.next(value)" [disabled]="disabled" data-cy="specimen-range-button">Add</button>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [FormsModule]
})
export class SpecimenRangeSelectEmbedComponent{
  value = '';
  disabled = false;

  specimenRangeClick = new Subject<string>();
}
