import { format, formatDistanceToNow, isBefore, isValid, parseISO } from 'date-fns';

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? parseISO(value) : value;
}

export function formatDate(value: string | Date | null | undefined, pattern = 'MMM d, yyyy'): string {
  if (!value) return '—';
  const date = toDate(value);
  return isValid(date) ? format(date, pattern) : '—';
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, 'MMM d, yyyy · h:mm a');
}

export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = toDate(value);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '—';
}

export function isPastDue(value: string | Date | null | undefined): boolean {
  if (!value) return false;
  const date = toDate(value);
  return isValid(date) && isBefore(date, new Date());
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

export function formatStorageCapacity(capacity: number, unit: string): string {
  return `${capacity} ${unit}`;
}
