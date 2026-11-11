const MS_PER_DAY = 86_400_000;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Format a Date as a local YYYY-MM-DD string (never shifts by timezone). */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Parse YYYY-MM-DD as a local-midnight Date, or null when malformed. */
export function parseISODate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

/** Add months, clamping the day so 31 Jan + 1 month lands on 28/29 Feb. */
export function addMonthsISO(iso: string, months: number): string {
  const base = parseISODate(iso) ?? new Date();
  const target = new Date(base.getFullYear(), base.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(base.getDate(), lastDay));
  return toISODate(target);
}

export function shiftDaysISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Thai display format with Buddhist era, e.g. 12/11/2569. */
export function formatThaiDate(iso: string | null | undefined): string {
  const date = parseISODate(iso);
  if (!date) return '-';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear() + 543}`;
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Whole days from today until the given date (negative when already past). */
export function daysUntil(iso: string): number {
  const target = parseISODate(iso);
  if (!target) return Number.NaN;
  const today = parseISODate(todayISO());
  if (!today) return Number.NaN;
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}

export type ExpiryState = 'expired' | 'soon' | 'valid';

export function expiryState(iso: string, soonDays = 30): ExpiryState {
  const days = daysUntil(iso);
  if (Number.isNaN(days)) return 'valid';
  if (days < 0) return 'expired';
  if (days <= soonDays) return 'soon';
  return 'valid';
}
