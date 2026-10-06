import type { LatLng } from '../types';

/** Ikki nuqta orasidagi masofa (km), haversine formulasi */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Radius doirasi xaritada to'liq ko'rinishi uchun delta */
export function regionForRadius(center: LatLng, radiusKm: number) {
  const latDelta = (radiusKm * 2.4) / 111;
  const lngDelta = latDelta / Math.cos((center.lat * Math.PI) / 180);
  return { latitude: center.lat, longitude: center.lng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
}
