import type { SessionCode } from '../types';

export const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
export const MONTHS_CAP = MONTHS.map((m) => m[0].toUpperCase() + m.slice(1));
export const WEEKDAYS = ['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba'];
export const WEEKDAYS_SHORT = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

export const SESSION_LABEL: Record<SessionCode, string> = { morning: 'Nahorgi osh', day: 'Kunduzgi', evening: 'Kechki' };
export const SESSION_ORDER: SessionCode[] = ['morning', 'day', 'evening'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Mahalliy vaqt bo'yicha YYYY-MM-DD */
export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toMonthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const startOfToday = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

/** Dushanba = 0 */
export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;
export const isWeekend = (d: Date) => weekdayIndex(d) >= 5;

/** "9-oktabr, juma" */
export const formatDayLong = (iso: string) => {
  const d = parseISODate(iso);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${WEEKDAYS[weekdayIndex(d)]}`;
};

/** "Bugun" / "Ertaga" / "Payshanba" / "12-oktabr" */
export function relativeDayLabel(iso: string): string {
  const today = startOfToday();
  const d = parseISODate(iso);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Bugun';
  if (diff === 1) return 'Ertaga';
  if (diff > 1 && diff < 7) {
    const w = WEEKDAYS[weekdayIndex(d)];
    return w[0].toUpperCase() + w.slice(1);
  }
  return `${d.getDate()}-${MONTHS[d.getMonth()]}`;
}

/** "6–8 oktabr" */
export function rangeLabel(from: Date, to: Date): string {
  if (from.getMonth() === to.getMonth()) return `${from.getDate()}–${to.getDate()} ${MONTHS[to.getMonth()]}`;
  return `${from.getDate()}-${MONTHS[from.getMonth()]} – ${to.getDate()}-${MONTHS[to.getMonth()]}`;
}
