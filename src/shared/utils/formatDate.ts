const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const DATETIME_SECONDS_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' });

export function formatDate(date: string | Date): string {
  return DATE_FORMATTER.format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return DATETIME_FORMATTER.format(new Date(date));
}

export function formatDateTimeSeconds(date: string | Date): string {
  return DATETIME_SECONDS_FORMATTER.format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const target = new Date(date).getTime();
  const diffMs = target - now;
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSeconds) < 60) return RELATIVE_FORMATTER.format(diffSeconds, 'second');
  if (Math.abs(diffMinutes) < 60) return RELATIVE_FORMATTER.format(diffMinutes, 'minute');
  if (Math.abs(diffHours) < 24) return RELATIVE_FORMATTER.format(diffHours, 'hour');
  return RELATIVE_FORMATTER.format(diffDays, 'day');
}

export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
