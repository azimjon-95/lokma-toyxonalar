// Narx qoidalari (TZ 4.3). Server ham aynan shu formulani ishlatishi kerak.
import type { MenuPackage, SessionTemplate } from '../types';

export const roundTo1000 = (n: number) => Math.round(n / 1000) * 1000;

export function pricePerGuest(menu: MenuPackage, session: SessionTemplate, weekend: boolean, weekendFactor: number) {
  return roundTo1000(menu.price_per_guest * session.price_factor * (weekend ? weekendFactor : 1));
}

export function priceRange(menus: MenuPackage[], sessions: SessionTemplate[], weekendFactor: number) {
  const prices = menus.map((m) => m.price_per_guest);
  const factors = sessions.map((s) => s.price_factor);
  return {
    from: roundTo1000(Math.min(...prices) * Math.min(...factors)),
    to: roundTo1000(Math.max(...prices) * Math.max(...factors) * weekendFactor),
  };
}
