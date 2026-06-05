const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatClinicalDate = (date: Date): string => {
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day.toString().padStart(2, '0')}-${month}-${year}`;
};

export const clinicalDateToIsoDate = (value?: string): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  const clinicalMatch = trimmed.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);

  if (clinicalMatch) {
    const day = Number(clinicalMatch[1]);
    const monthIndex = monthNames.findIndex((month) => month.toLowerCase() === clinicalMatch[2].toLowerCase());
    let year = Number(clinicalMatch[3]);
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
};
