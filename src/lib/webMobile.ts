import { Platform } from 'react-native';

/*
 * ═══ VEBDA "MOBIL ILOVA" HISSI ═══
 * To'yxonalar sayti brauzerda (ayniqsa Lokma Go ichida) oddiy veb-sahifa
 * kabi emas, mobil ilova kabi ishlashi uchun:
 *   • matn belgilanmaydi / nusxalanmaydi (yozish maydonlaridan tashqari);
 *   • uzoq bosishda brauzer menyusi, rasm sudrash, bosilganda kulrang chaqnash yo'q;
 *   • ikki marta bosishda zoom yo'q, sahifa chegarada "rezina" bo'lib cho'zilmaydi;
 *   • skrollbar ko'rinmaydi (mobil ilovalardagidek);
 *   • maydonga bosilganda iOS sahifani kattalashtirmaydi.
 */
const CSS = `
html, body { overscroll-behavior: none; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
/* Ichki skroll konteynerlari ham chegarada cho'zilmaydi: pastga tortganda sahifa qotib turadi */
div { overscroll-behavior: none; }
* { -webkit-tap-highlight-color: transparent; -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; scrollbar-width: none; }
*::-webkit-scrollbar { width: 0; height: 0; display: none; }
input, textarea, [contenteditable="true"] { -webkit-user-select: text; user-select: text; -webkit-touch-callout: default; font-size: 16px; }
img { -webkit-user-drag: none; user-drag: none; pointer-events: none; }
a, button, [role="button"], [role="link"], [role="tab"], [tabindex] { touch-action: manipulation; cursor: default; }
:focus:not(:focus-visible) { outline: none; }
`;

let applied = false;

export function applyMobileWebFeel() {
  if (applied || Platform.OS !== 'web' || typeof document === 'undefined') return;
  applied = true;
  const style = document.createElement('style');
  style.setAttribute('data-lokma', 'mobile-feel');
  style.textContent = CSS;
  document.head.appendChild(style);

  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    document.head.appendChild(meta);
  }
  // maximum-scale=1 — iOS fokusdagi avtomatik zoom yo'q (barmoq bilan kattalashtirish baribir mumkin)
  meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover');
}
