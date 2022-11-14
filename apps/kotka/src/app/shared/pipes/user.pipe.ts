import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../services/user.service';
import { forkJoin, Observable } from 'rxjs';

@Pipe({
  name: 'user',
  pure: false
})
export class UserPipe implements PipeTransform {
  value: string|string[] = '';
  lastId?: string|string[];
  lastFormat?: string;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  transform(value: string|string[], format: 'fullName' = 'fullName'): string|string[] {
    if (!value || value.length === 0) {
      return value;
    }

    if (value === this.lastId && format === this.lastFormat) {
      return this.value;
    }

    this.lastId = value;
    this.lastFormat = format;

    this.updateValue(value, format);
    return this.value;
  }

  private updateValue(id: string|string[], format: 'fullName' = 'fullName'): void {
    const nameObs$: Observable<string|string[]> = Array.isArray(id) ?
      forkJoin(id.map(userId => this.userService.getPersonInfo(userId, format))) :
      this.userService.getPersonInfo(id, format);

    nameObs$.subscribe(name => {
      this.value = name;
      this.cdr.markForCheck();
    });
  }
}
