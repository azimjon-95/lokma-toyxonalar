import type { LatLng } from '../types';

const R_KM = 6371.0088;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Yandex / OSM bilan bir xil [lng, lat] tartibi */
export type LngLat = [number, number];
/** Yuqori-chap va pastki-o'ng burchaklar: [[west, north], [east, south]] (Yandex LngLatBounds) */
export type Bounds = [LngLat, LngLat];

/** Sferik "boshlang'ich nuqta + yo'nalish + masofa" → manzil nuqtasi (aniq geodezik) */
export function destination(from: LatLng, bearingDeg: number, distKm: number): LatLng {
  const φ1 = rad(from.lat), λ1 = rad(from.lng), θ = rad(bearingDeg), δ = distKm / R_KM;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: deg(φ2), lng: ((deg(λ2) + 540) % 360) - 180 };
}

/** Radius doirasi: markazdan aynan `km` masofadagi nuqtalar (yopiq halqa, GeoJSON Polygon uchun) */
export function ringAround(center: LatLng, km: number, steps = 96): LngLat[] {
  const ring: LngLat[] = [];
  for (let i = 0; i < steps; i++) {
    const p = destination(center, (360 * i) / steps, km);
    ring.push([p.lng, p.lat]);
  }
  ring.push(ring[0]);
  return ring;
}

/** Doirani to'liq o'z ichiga olgan chegaralar (pad — ozgina bo'sh joy) */
export function boundsAround(center: LatLng, km: number, pad = 1.06): Bounds {
  const k = km * pad;
  const n = destination(center, 0, k).lat, s = destination(center, 180, k).lat;
  const e = destination(center, 90, k).lng, w = destination(center, 270, k).lng;
  return [[w, n], [e, s]];
}

/** Nuqtalar to'plamini o'rovchi chegaralar; `ratio` — har tomondan kengaytirish ulushi */
export function boundsOf(points: LngLat[], ratio = 0.12): Bounds | null {
  if (!points.length) return null;
  let w = Infinity, e = -Infinity, s = Infinity, n = -Infinity;
  for (const [lng, lat] of points) { w = Math.min(w, lng); e = Math.max(e, lng); s = Math.min(s, lat); n = Math.max(n, lat); }
  const dx = Math.max((e - w) * ratio, 0.01), dy = Math.max((n - s) * ratio, 0.008);
  return [[w - dx, n + dy], [e + dx, s - dy]];
}

/** Web Mercator: koordinata → piksel (`zoom` da dunyo 256·2^zoom px) */
export function mercatorPx(lng: number, lat: number, zoom: number): { x: number; y: number } {
  const scale = 256 * 2 ** zoom;
  const s = Math.sin(rad(Math.max(-85.0511, Math.min(85.0511, lat))));
  return { x: ((lng + 180) / 360) * scale, y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale };
}

export interface PinItem { id: string; x: number; y: number; rating: number }
export interface PinGroup { ids: string[]; lng: number; lat: number }

/**
 * To'qnashayotgan narx belgilarini jamlash (ekran pikselida). Tanlangan to'yxona HAR DOIM yakka.
 * Reyting yuqorilari birinchi yakka qoladi. Chegara: pill ~58×30 px.
 */
export function clusterPins(items: (PinItem & { lng: number; lat: number })[], selectedId: string | null, dx = 58, dy = 30): PinGroup[] {
  const order = [...items].sort((a, b) => (b.id === selectedId ? 1 : 0) - (a.id === selectedId ? 1 : 0) || b.rating - a.rating);
  const used = new Set<string>();
  const out: PinGroup[] = [];
  for (const it of order) {
    if (used.has(it.id)) continue;
    used.add(it.id);
    const members = [it];
    if (it.id !== selectedId) {
      for (const o of order) {
        if (used.has(o.id) || o.id === selectedId) continue;
        if (Math.abs(o.x - it.x) < dx && Math.abs(o.y - it.y) < dy) { used.add(o.id); members.push(o); }
      }
    }
    out.push({ ids: members.map((m) => m.id), lng: members.reduce((s, m) => s + m.lng, 0) / members.length, lat: members.reduce((s, m) => s + m.lat, 0) / members.length });
  }
  return out;
}
