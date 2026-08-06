import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { Branch } from '@luomus/laji-schema';
import { LabelPipe } from '@kotka/ui/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'kotka-branch-card',
  templateUrl: './branch-card.component.html',
  styleUrls: ['./branch-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LabelPipe, NgClass],
})
export class BranchCardComponent {
  branch = input.required<Branch>();
  editBranch = output<Branch>();

  editBranchClick(event: Event) {
    event.stopPropagation();
    this.editBranch.emit(this.branch());
  }
}
