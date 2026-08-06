import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { Branch } from '@luomus/laji-schema';

@Component({
  selector: 'kotka-branch-card',
  templateUrl: './branch-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class BranchCardComponent {
  @Input({ required: true }) branch!: Branch;
  @Output() editBranch = new EventEmitter<Branch>();

  editBranchClick() {
    this.editBranch.emit(this.branch);
  }
}
