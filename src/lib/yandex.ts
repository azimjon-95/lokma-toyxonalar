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
export const MAP_PROVIDER = (process.env.EXPO_PUBLIC_MAP_PROVIDER ?? 'auto') as 'auto' | 'yandex' | 'maplibre' | 'osm';
/** Diagnostika chipi (qaysi xarita va nega zaxiraga o'tilgani) — sinov bosqichida yoqiladi */
export const MAP_DIAG = ['1', 'true'].includes(process.env.EXPO_PUBLIC_MAP_DIAG ?? '');
export const YANDEX_LANG = process.env.EXPO_PUBLIC_YANDEX_LANG ?? 'ru_RU';
/** Alohida paketlar kalitlari: qidiruv/geokoder va marshrut (ixtiyoriy; xaritaning o'zi MAPS kalit bilan ishlaydi) */
const GEOCODER_KEY = process.env.EXPO_PUBLIC_YANDEX_GEOCODER_KEY ?? '';
const ROUTING_KEY = process.env.EXPO_PUBLIC_YANDEX_ROUTING_KEY ?? '';
export const yandexEnabled = YANDEX_KEY.length > 0 && (MAP_PROVIDER === 'auto' || MAP_PROVIDER === 'yandex');

export type YandexApi = typeof ymaps3;

export interface YandexLoad { api: YandexApi | null; reason?: string }

let loading: Promise<YandexLoad> | null = null;

/** API'ni bir marta yuklaydi. Muvaffaqiyatsiz bo'lsa api=null va sabab (xarita zaxiraga o'tadi) */
export function loadYandexMaps(timeoutMs = 10_000): Promise<YandexLoad> {
  if (!yandexEnabled) return Promise.resolve({ api: null, reason: YANDEX_KEY ? 'o\'chirilgan (MAP_PROVIDER)' : 'kalit yo\'q' });
  if (typeof document === 'undefined') return Promise.resolve({ api: null, reason: 'brauzer emas' });
  if (loading) return loading;
  loading = new Promise<YandexLoad>((resolve) => {
    const g = globalThis as unknown as { ymaps3?: YandexApi };
    const done = (r: YandexLoad) => { if (!r.api) loading = null; resolve(r); };
    const finish = () => {
      void Promise.resolve(g.ymaps3!.ready).then(() => {
        try {
          // search/router xizmatlari alohida kalit bilan (berilgan bo'lsa)
          g.ymaps3!.getDefaultConfig().setApikeys({ ...(GEOCODER_KEY ? { search: GEOCODER_KEY, suggest: GEOCODER_KEY } : {}), ...(ROUTING_KEY ? { router: ROUTING_KEY } : {}) });
        } catch { /* kalit sozlanmasa ham xarita ishlayveradi */ }
        done({ api: g.ymaps3 ?? null, reason: g.ymaps3 ? undefined : 'ymaps3 topilmadi' });
      }, (e: unknown) => done({ api: null, reason: `ready rad etildi: ${String(e)}` }));
    };
    if (g.ymaps3) { finish(); return; }
    const timer = setTimeout(() => done({ api: null, reason: `skript ${timeoutMs / 1000} s ichida yuklanmadi` }), timeoutMs);
    const s = document.createElement('script');
    s.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(YANDEX_KEY)}&lang=${encodeURIComponent(YANDEX_LANG)}`;
    s.async = true;
    s.onload = () => { clearTimeout(timer); finish(); };
    // Brauzer 403 bilan tarmoq xatosini ajratmaydi: odatda — kalit noto'g'ri yoki domen "HTTP Referer" ro'yxatida yo'q
    s.onerror = () => { clearTimeout(timer); s.remove(); done({ api: null, reason: `skript yuklanmadi (403: kalit yoki domen ruxsati · ${location.hostname})` }); };
    document.head.appendChild(s);
  });
  return loading;
}
