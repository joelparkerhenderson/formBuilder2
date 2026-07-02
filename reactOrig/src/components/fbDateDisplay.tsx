import React from 'react';
import { formatFormDate } from '../utils/dateFormat';

interface fbDateDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  value?: string | Date | null;
}

export function formatDisplayDate(value?: string | Date | null): string {
  if (!value) return '';
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return formatFormDate(value);
  }
  const trimmed = value.trim();
  if (!trimmed) return '';
  const isoDateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnly) {
    const [, year, month, day] = isoDateOnly;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return formatFormDate(date);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return formatFormDate(parsed);
}

export const fbDateDisplay: React.FC<fbDateDisplayProps> = ({
  value,
  className = '',
  ...props
}) => {
  return (
    <span className={`fb-date-display ${className}`.trim()} {...props}>
      {formatDisplayDate(value)}
    </span>
  );
};

