import type { LatLng } from '../types';

/** Radius shu qiymatdan katta bo'lsa — "butun O'zbekiston": doira chizilmaydi, xarita natijalarga moslanadi */
export const WIDE_RADIUS_KM = 500;

/** Markazdan `km` shimolda joylashgan nuqta (radius yorlig'i uchun) */
export const northOf = (c: LatLng, km: number): LatLng => ({ lat: c.lat + km / 111.32, lng: c.lng });

/** Yo'l ko'rsatish: Yandex Maps (O'zbekistonda eng keng tarqalgan) va Google Maps */
export const directionsUrl = (from: LatLng, to: LatLng, app: 'yandex' | 'google' = 'yandex') =>
  app === 'yandex'
    ? `https://yandex.com/maps/?rtext=${from.lat},${from.lng}~${to.lat},${to.lng}&rtt=auto`
    : `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=driving`;
