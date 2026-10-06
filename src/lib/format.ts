// Intl'ga bog'liq emas (Hermes'da 'uz' lokali bo'lmasligi mumkin)

export function formatNumber(value: number): string {
  const n = Math.round(value);
  const sign = n < 0 ? '-' : '';
  return sign + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export const formatSum = (value: number) => `${formatNumber(value)} so‘m`;

/** 150000 -> "150 ming", 5000000 -> "5 mln" */
export function formatShort(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1).replace('.', ',')} mln`;
  }
  return `${Math.round(value / 1000)} ming`;
}

export const formatPinPrice = (value: number) => `${Math.round(value / 1000)}k`;

export const formatKm = (km: number) => `${km < 10 ? km.toFixed(1).replace('.', ',') : Math.round(km)} km`;

/** +998 90 123 45 67 */
export function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, '').replace(/^998/, '').slice(0, 9);
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean);
  return '+998' + (parts.length ? ' ' + parts.join(' ') : '');
}

export const isValidPhone = (input: string) => input.replace(/\D/g, '').replace(/^998/, '').length === 9;
