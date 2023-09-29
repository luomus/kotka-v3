import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { LabelKey, LabelService } from '../services/api-services/label.service';

@Pipe({
  name: 'label',
  pure: false
})
export class LabelPipe implements PipeTransform {
  value: string|string[] = '';
  lastId?: LabelKey|LabelKey[];

  constructor(
    private labelService: LabelService,
    private cdr: ChangeDetectorRef
  ) {}

  transform(value?: LabelKey): string;
  transform(value?: LabelKey[]): string[];
  transform(value?: LabelKey|LabelKey[]): string|string[] {
    if (value == null || (Array.isArray(value) && value.length === 0)) {
      return '';
    }

    if (value === this.lastId) {
      return this.value;
    }

    this.lastId = value;

    this.updateValue(value);
    return this.value;
  }

  private updateValue(id: LabelKey|LabelKey[]): void {
    const label$: Observable<string|string[]> = Array.isArray(id) ?
      forkJoin(id.map(_id => this.labelService.getLabel(_id))) :
      this.labelService.getLabel(id);

    label$.subscribe(label => {
      this.value = label;
      this.cdr.markForCheck();
    });
  }
}
