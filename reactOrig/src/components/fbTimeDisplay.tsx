import React from 'react';

interface fbTimeDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  value?: string | Date | null;
}

export function formatDisplayTime(value?: string | Date | null): string {
  if (!value) return '';
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return formatDateTime(value);
  }
  const trimmed = value.trim();
  if (!trimmed) return '';
  const timeOnly = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/);
  if (timeOnly) return `${timeOnly[1].padStart(2, '0')}:${timeOnly[2]}`;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return formatDateTime(parsed);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export const fbTimeDisplay: React.FC<fbTimeDisplayProps> = ({
  value,
  className = '',
  ...props
}) => {
  return (
    <span className={`fb-time-display ${className}`.trim()} {...props}>
      {formatDisplayTime(value)}
    </span>
  );
};

