type DatePieces = {
  day: number;
  month: number;
  year: number;
};

export function formatDate(
  dateBegin: string | undefined,
  dateEnd: string | undefined,
  monthType: 'roman' | 'abbr' = 'roman',
  dateFormat: 'finnish' = 'finnish',
): string {
  const start = extractDatePieces(dateBegin, dateFormat);
  const end = extractDatePieces(dateEnd, dateFormat);

  if (!start) {
    return '';
  }
  if (!end) {
    return `${start.day}.${monthToLabel(start.month, monthType)}.${start.year}`;
  }

  const startMonthLabel = monthToLabel(start.month, monthType);
  const endMonthLabel = monthToLabel(end.month, monthType);

  const sameYear = start.year === end.year;
  const sameMonth = start.month === end.month;

  const wholeYear =
    start.day === 1 && start.month === 1 && end.day === 31 && end.month === 12;

  if (dateBegin === dateEnd) {
    return `${start.day}.${startMonthLabel}.${start.year}`;
  } else if (sameYear) {
    if (sameMonth) {
      const lastDayOfMonth = new Date(start.year, start.month, 0).getDate();
      const wholeMonth = start.day === 1 && end.day === lastDayOfMonth;

      if (wholeMonth) {
        return `${startMonthLabel}.${start.year}`;
      } else {
        return `${start.day}.-${end.day}.${startMonthLabel}.${start.year}`;
      }
    } else {
      if (wholeYear) {
        return `${start.year}`;
      }
      return `${start.day}.${startMonthLabel}.-${end.day}.${endMonthLabel}.${start.year}`;
    }
  } else {
    return `${start.day}.${startMonthLabel}.${start.year}-${end.day}.${endMonthLabel}.${end.year}`;
  }
}

function extractDatePieces(
  date: string | undefined,
  format: 'finnish' = 'finnish',
): DatePieces | undefined {
  if (!date) {
    return undefined;
  }

  if (format === 'finnish') {
    const parts = date.split('.');
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      return { day, month, year };
    }
  }

  return undefined;
}

function monthToLabel(month: number, type: 'roman' | 'abbr'): string {
  const roman = [
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
    'X',
    'XI',
    'XII',
  ];
  const abbr = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return type === 'roman' ? roman[month - 1] : abbr[month - 1];
}
