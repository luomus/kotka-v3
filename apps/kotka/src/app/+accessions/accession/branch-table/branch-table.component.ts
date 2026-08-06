import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  Signal,
} from '@angular/core';
import { Branch } from '@luomus/laji-schema';
import { BreakpointService } from '@kotka/ui/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { BranchCardComponent } from '../branch-card/branch-card.component';
import { BranchEventsCardComponent } from '../branch-events-card/branch-events-card.component';

@Component({
  selector: 'kotka-branch-table',
  templateUrl: './branch-table.component.html',
  styleUrls: ['./branch-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, BranchCardComponent, BranchEventsCardComponent],
})
export class BranchTableComponent {
  private breakPointService = inject(BreakpointService);

  branches = input.required<Branch[]>();
  showDepleted = input<boolean>();

  editBranch = output<Branch>();

  branchIsOpen: Record<string, boolean> = {};

  rows$: Observable<Branch[][]>;

  private visibleBranches: Signal<Branch[]>;

  constructor() {
    this.visibleBranches = computed(() =>
      this.branches().filter((branch) => this.showDepleted() || branch.exists),
    );

    const nbrOfCols$ = this.breakPointService
      .getBreakpointState$(['sm', 'md'])
      .pipe(map((state) => (state.md ? 6 : state.sm ? 4 : 1)));

    this.rows$ = combineLatest([
      toObservable(this.visibleBranches),
      nbrOfCols$,
    ]).pipe(
      map(([branches, nbrOfCols]) => {
        const rows: Branch[][] = [];

        let rest = branches;
        while (rest.length > 0) {
          rows.push(rest.slice(0, nbrOfCols));
          rest = rest.slice(nbrOfCols);
        }

        return rows;
      }),
    );

    effect(() => {
      this.branches();
      this.branchIsOpen = {};
    });
  }

  toggleBranchOpen(branchId: string) {
    this.branchIsOpen[branchId] = !this.branchIsOpen[branchId];
  }
}
