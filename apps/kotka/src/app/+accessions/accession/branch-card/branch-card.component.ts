import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Input({ required: true }) branch!: Branch;
  @Output() editBranch = new EventEmitter<Branch>();

  editBranchClick() {
    this.editBranch.emit(this.branch);
  }
}
