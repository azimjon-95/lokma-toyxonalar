/*
 * ═══ YANDEX MAPS JS API v3 — yuklovchi ═══
 * Kalit: EXPO_PUBLIC_YANDEX_MAPS_KEY (developer.tech.yandex.ru → "JavaScript API и HTTP Геокодер").
 * Kalitda "Ограничение по HTTP Referer" TO'LDIRILGAN bo'lishi shart (aks holda v3 ishlamaydi) — domenlarni yozing.
 *
 * EXPO_PUBLIC_MAP_PROVIDER: auto (standart: kalit bo'lsa Yandex) | yandex | osm (Leaflet + OpenStreetMap)
 * Yandex yuklanmasa (kalit noto'g'ri, domen ruxsat etilmagan, internet/blok) — xarita AVTOMATIK OSM'ga o'tadi.
 * Til: Yandex faqat ru_RU, en_US, tr_TR, uk_UA va h.k. ni qo'llaydi (o'zbekcha yo'q); standart ru_RU.
 */
export const YANDEX_KEY = process.env.EXPO_PUBLIC_YANDEX_MAPS_KEY ?? '';
export const MAP_PROVIDER = (process.env.EXPO_PUBLIC_MAP_PROVIDER ?? 'auto') as 'auto' | 'yandex' | 'osm';
export const YANDEX_LANG = process.env.EXPO_PUBLIC_YANDEX_LANG ?? 'ru_RU';
/** Alohida paketlar kalitlari: qidiruv/geokoder va marshrut (ixtiyoriy; xaritaning o'zi MAPS kalit bilan ishlaydi) */
const GEOCODER_KEY = process.env.EXPO_PUBLIC_YANDEX_GEOCODER_KEY ?? '';
const ROUTING_KEY = process.env.EXPO_PUBLIC_YANDEX_ROUTING_KEY ?? '';
export const yandexEnabled = YANDEX_KEY.length > 0 && MAP_PROVIDER !== 'osm';

export type YandexApi = typeof ymaps3;

let loading: Promise<YandexApi | null> | null = null;

/** API'ni bir marta yuklaydi. Muvaffaqiyatsiz bo'lsa null (xarita OSM'ga o'tadi) */
export function loadYandexMaps(timeoutMs = 10_000): Promise<YandexApi | null> {
  if (!yandexEnabled || typeof document === 'undefined') return Promise.resolve(null);
  if (loading) return loading;
  loading = new Promise<YandexApi | null>((resolve) => {
    const g = globalThis as unknown as { ymaps3?: YandexApi };
    const done = (api: YandexApi | null) => { if (!api) loading = null; resolve(api); };
    const finish = () => {
      void Promise.resolve(g.ymaps3!.ready).then(() => {
        try {
          // search/router xizmatlari alohida kalit bilan (berilgan bo'lsa)
          g.ymaps3!.getDefaultConfig().setApikeys({ ...(GEOCODER_KEY ? { search: GEOCODER_KEY, suggest: GEOCODER_KEY } : {}), ...(ROUTING_KEY ? { router: ROUTING_KEY } : {}) });
        } catch { /* kalit sozlanmasa ham xarita ishlayveradi */ }
        done(g.ymaps3 ?? null);
      }, () => done(null));
    };
    if (g.ymaps3) { finish(); return; }
    const timer = setTimeout(() => done(null), timeoutMs);
    const s = document.createElement('script');
    s.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(YANDEX_KEY)}&lang=${encodeURIComponent(YANDEX_LANG)}`;
    s.async = true;
    s.onload = () => { clearTimeout(timer); finish(); };
    s.onerror = () => { clearTimeout(timer); s.remove(); done(null); }; // 403 (kalit/domen), tarmoq xatosi
    document.head.appendChild(s);
  });
  return loading;
}
