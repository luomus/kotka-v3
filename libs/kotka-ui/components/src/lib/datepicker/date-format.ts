import { Injectable, signal } from '@angular/core';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { padDayOrMonth } from '@kotka/ui/core';

export type DateFormat = 'iso' | 'finnish';

export const DATE_FORMAT_PLACEHOLDERS: Record<DateFormat, string> = {
  iso: 'yyyy-mm-dd',
  finnish: 'dd.mm.yyyy',
};

export function formatDate(value: Date, format: DateFormat = 'iso'): string {
  const day = padDayOrMonth(value.getDate());
  const month = padDayOrMonth(value.getMonth() + 1);
  const year = value.getFullYear();

  return format === 'finnish' ? `${day}.${month}.${year}` : `${year}-${month}-${day}`;
}

export function parseDate(value: string, format: DateFormat = 'iso'): Date | null {
  const dateStruct = stringToDateStruct(value, format);
  return dateStructToDate(dateStruct);
}

export function stringToDateStruct(
  value: string | null | undefined,
  format?: DateFormat
): NgbDateStruct | null {
  const trimmedValue = (value ?? '').trim();

  if (!format || format === 'iso') {
    const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmedValue);
    if (isoMatch) {
      return {
        year: parseInt(isoMatch[1], 10),
        month: parseInt(isoMatch[2], 10),
        day: parseInt(isoMatch[3], 10),
      };
    }
  }

  if (!format || format === 'finnish') {
    const finnishMatch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(trimmedValue);
    if (finnishMatch) {
      return {
        day: parseInt(finnishMatch[1], 10),
        month: parseInt(finnishMatch[2], 10),
        year: parseInt(finnishMatch[3], 10),
      };
    }
  }

  return null;
}

export function dateStructToString(
  date: NgbDateStruct | null | undefined,
  format: DateFormat = 'iso',
): string | null {
  if (!date) {
    return null;
  }

  const day = padDayOrMonth(date.day);
  const month = padDayOrMonth(date.month);

  return format === 'finnish'
    ? `${day}.${month}.${date.year}`
    : `${date.year}-${month}-${day}`;
}

export function dateToDateStruct(
  value: Date | null | undefined,
): NgbDateStruct | null {
  return value
    ? {
        day: value.getDate(),
        month: value.getMonth() + 1,
        year: value.getFullYear(),
      }
    : null;
}

export function dateStructToDate(
  date: NgbDateStruct | null | undefined,
): Date | null {
  return date ? new Date(date.year, date.month - 1, date.day) : null;
}

/**
 * Handles how the date is rendered and parsed in the input field.
 */
@Injectable()
export class KotkaDateParserFormatter extends NgbDateParserFormatter {
  private dateFormat = signal<DateFormat>('iso');

  setDateFormat(format: DateFormat) {
    this.dateFormat.set(format);
  }

  parse(value: string): NgbDateStruct | null {
    return stringToDateStruct(value);
  }

  format(date: NgbDateStruct | null): string {
    return dateStructToString(date, this.dateFormat()) ?? '';
  }
}

/**
 * Handles how the date is represented in the model when the model value is a Date.
 */
@Injectable()
export class KotkaDateAdapter extends NgbDateAdapter<Date> {
  fromModel(value: Date | string | null): NgbDateStruct | null {
    return typeof value === 'string' ? null : dateToDateStruct(value);
  }

  toModel(date: NgbDateStruct | null): Date | null {
    return dateStructToDate(date);
  }
}
