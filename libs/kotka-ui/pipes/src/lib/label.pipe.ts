import {
  ChangeDetectorRef,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { LabelKey, LabelService } from '@kotka/ui/data-services';


@Pipe({
  name: 'label',
  pure: false,
})
export class LabelPipe implements PipeTransform, OnDestroy {
  value: string | string[] = '';
  lastId?: LabelKey | LabelKey[];

  private labelSub?: Subscription;

  constructor(
    private labelService: LabelService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy() {
    this.labelSub?.unsubscribe();
  }

  transform(value?: LabelKey, placeholder?: string): string;
  transform(value?: LabelKey[], placeholder?: string): string[];
  transform(
    value?: LabelKey | LabelKey[],
    placeholder = '',
  ): string | string[] {
    if (value == null || (Array.isArray(value) && value.length === 0)) {
      this.labelSub?.unsubscribe();
      return '';
    }

    if (value === this.lastId) {
      return this.value;
    }

    this.lastId = value;

    this.value = placeholder;
    this.updateValue(value);
    return this.value;
  }

  private updateValue(value: LabelKey | LabelKey[]): void {
    this.labelSub?.unsubscribe();

    const label$: Observable<string | string[]> = Array.isArray(value)
      ? forkJoin(value.map((_value) => this.labelService.getLabel(_value)))
      : this.labelService.getLabel(value);

    this.labelSub = label$.subscribe((label) => {
      this.value = label;
      this.cdr.detectChanges(); // needs detectChanges because markForCheck doesn't work sometimes
    });
  }
}
