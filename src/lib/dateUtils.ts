/**
 * Parse a YYYY-MM-DD date string as LOCAL midnight (not UTC midnight).
 * `new Date('2026-08-15')` gives UTC midnight which in IST = Aug 14 18:30 UTC — WRONG.
 * `new Date(2026, 7, 15)` gives IST midnight — CORRECT.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Returns today's date as YYYY-MM-DD in local timezone */
export function localToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Given `from` and `to` YYYY-MM-DD strings, returns local start/end Date objects.
 * Default = today if not provided.
 */
export function getLocalDateRange(from?: string | null, to?: string | null): { start: Date; end: Date } {
  const t = localToday();
  const fromStr = from || t;
  const toStr = to || t;

  const start = parseLocalDate(fromStr);
  start.setHours(0, 0, 0, 0);

  const end = parseLocalDate(toStr);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
