import type { LatLng } from '../types';

/** Radius shu qiymatdan katta bo'lsa — "butun O'zbekiston": doira chizilmaydi, xarita natijalarga moslanadi */
export const WIDE_RADIUS_KM = 500;

/** Markazdan `km` shimolda joylashgan nuqta (radius yorlig'i uchun) */
export const northOf = (c: LatLng, km: number): LatLng => ({ lat: c.lat + km / 111.32, lng: c.lng });

/**
 * Yandex Maps havolalari (yandex.uz — O'zbekiston uchun; telefonda Yandex Maps / Go ilovasi o'zi ochiladi, yo'q bo'lsa brauzerda).
 * Yo'l: "Siz" → to'yxona, avtomobil; Joy: to'yxonani xaritada ko'rish.
 */
export const directionsUrl = (from: LatLng, to: LatLng, app: 'yandex' | 'google' = 'yandex') =>
  app === 'yandex'
    ? `https://yandex.uz/maps/?rtext=${from.lat},${from.lng}~${to.lat},${to.lng}&rtt=auto`
    : `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=driving`;

export const placeUrl = (p: LatLng) => `https://yandex.uz/maps/?pt=${p.lng},${p.lat}&z=17&l=map`;
