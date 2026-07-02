const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatFormDate(value: Date | string | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day.toString().padStart(2, '0')}-${month}-${year}`;
}

export function formDateToIsoDate(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const formDateMatch = trimmed.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);

  if (formDateMatch) {
    const day = Number(formDateMatch[1]);
    const monthIndex = monthNames.findIndex((month) => month.toLowerCase() === formDateMatch[2].toLowerCase());
    let year = Number(formDateMatch[3]);
    if (year < 100) year += 2000;
    if (monthIndex >= 0) {
      const date = new Date(Date.UTC(year, monthIndex, day));
      if (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === monthIndex &&
        date.getUTCDate() === day
      ) {
        return date.toISOString().slice(0, 10);
      }
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

export function partialFormDateToIsoSortDate(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const yearOnlyMatch = trimmed.match(/^(\d{4})$/);
  if (yearOnlyMatch) return `${yearOnlyMatch[1]}-01-01`;

  const yearMonthMatch = trimmed.match(/^(\d{4})-(\d{1,2})$/);
  if (yearMonthMatch) {
    const year = Number(yearMonthMatch[1]);
    const month = Number(yearMonthMatch[2]);
    if (month >= 1 && month <= 12) {
      return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-01`;
    }
  }

  const monthYearMatch = trimmed.match(/^([A-Za-z]{3})[-\s](\d{4})$/);
  if (monthYearMatch) {
    const monthIndex = monthNames.findIndex((month) => month.toLowerCase() === monthYearMatch[1].toLowerCase());
    if (monthIndex >= 0) {
      return `${monthYearMatch[2]}-${(monthIndex + 1).toString().padStart(2, '0')}-01`;
    }
  }

  return formDateToIsoDate(trimmed);
}

export function generateUUID(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.random() * 16 | 0;
    const value = char === 'x' ? rand : (rand & 0x3 | 0x8);
    return value.toString(16);
  });
}
