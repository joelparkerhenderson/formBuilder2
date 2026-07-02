const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatFormDate(value: Date | string | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formDateToIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const exact = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(value.trim());
  if (!exact) return null;
  const day = Number(exact[1]);
  const month = monthNames.findIndex((name) => name.toLowerCase() === exact[2].toLowerCase());
  const year = Number(exact[3]);
  if (month < 0 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month, day));
  return date.toISOString();
}

export function partialFormDateToIsoSortDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const yearOnly = /^(\d{4})$/.exec(trimmed);
  if (yearOnly) return `${yearOnly[1]}-01-01`;

  const yearMonth = /^(\d{4})-(\d{1,2})$/.exec(trimmed);
  if (yearMonth) {
    const month = Number(yearMonth[2]);
    if (month >= 1 && month <= 12) return `${yearMonth[1]}-${String(month).padStart(2, '0')}-01`;
  }

  const monthYear = /^([A-Za-z]{3})[-\s](\d{4})$/.exec(trimmed);
  if (monthYear) {
    const month = monthNames.findIndex((name) => name.toLowerCase() === monthYear[1].toLowerCase());
    if (month >= 0) return `${monthYear[2]}-${String(month + 1).padStart(2, '0')}-01`;
  }

  const exactIso = formDateToIsoDate(trimmed);
  return exactIso ? exactIso.slice(0, 10) : null;
}

export function generateUUID(): string {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.random() * 16 | 0;
    const value = char === 'x' ? rand : (rand & 0x3 | 0x8);
    return value.toString(16);
  });
}
