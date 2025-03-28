import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kui-spinner',
  template: `
    <div
      class="spinner three-bounce-spinner"
      *ngIf="spinning"
      [ngClass]="{
        'overlay-spinner': overlay,
        'inline-spinner': !overlay,
        light: light
      }"
    >
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
    <ng-content *ngIf="!hideContentWhileLoading || !spinning"></ng-content>
  `,
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class SpinnerComponent {
  @Input() spinning = true;
  @Input() overlay = false;
  @Input() light = false;
  @Input() hideContentWhileLoading = false;
}
