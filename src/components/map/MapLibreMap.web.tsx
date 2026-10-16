import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import maplibregl, { type GeoJSONSource, type LngLatBoundsLike, type Map as MLMap, type Marker as MLMarker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { LatLng, VenueListItem } from '../../types';
import { toISODate } from '../../lib/dates';
import { WIDE_RADIUS_KM, northOf } from '../../lib/mapGeo';
import { boundsAround, boundsOf, clusterPins, ringAround, type Bounds, type LngLat } from '../../lib/mapMath';
import { WINE, clusterMarkup, ensureMapStyle, meMarkup, pinMarkup, radiusMarkup } from './mapStyles';
import type { LeafletMapHandle, LeafletMapProps } from './LeafletMap';
import { MAP_DIAG } from '../../lib/yandex';

/*
 * ═══ MapLibre GL + OpenFreeMap (kalitsiz, bepul, tijoratga ruxsat) ═══
 * Yandex ishlamasa shu xarita ochiladi: vektor, silliq zoom, WebGL. Interfeys LeafletMap/YandexMap bilan bir xil.
 * Uslub: EXPO_PUBLIC_MAPLIBRE_STYLE (standart OpenFreeMap "liberty"; "bright" / "positron" ham bor).
 * Eslatma: OpenFreeMap ommaviy serveri SLA bermaydi — yuqori ahamiyatli bo'lsa o'zingiz hostlang yoki MapTiler uslubini bering.
 */
const STYLE = process.env.EXPO_PUBLIC_MAPLIBRE_STYLE || 'https://tiles.openfreemap.org/styles/liberty';
const UZ_AREA: LngLatBoundsLike = [[54, 35.5], [75.5, 47.5]];
const ease = (t: number) => 1 - (1 - t) ** 3;
const SRC = 'lk-radius';

export interface MapLibreMapProps extends LeafletMapProps {
  onFailure: (reason: string) => void;
}

const lngLat = (p: LatLng): LngLat => [p.lng, p.lat];
const toML = (b: Bounds): LngLatBoundsLike => [[b[0][0], b[1][1]], [b[1][0], b[0][1]]]; // [[w,n],[e,s]] → [sw, ne]
const polygon = (center: LatLng, km: number) => ({ type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: [ringAround(center, km)] } });

function holder(html: string): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = 'position:relative;width:0;height:0;';
  el.innerHTML = html;
  return el;
}

export const MapLibreMap = forwardRef<LeafletMapHandle, MapLibreMapProps>(function MapLibreMap(props, ref) {
  const host = useRef<HTMLDivElement | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const st = useRef<{
    map: MLMap | null; loaded: boolean; me: MLMarker | null; label: MLMarker | null; labelEl: HTMLElement | null;
    pins: Map<string, { marker: MLMarker; el: HTMLElement; venue: VenueListItem }>; shown: Set<string>; clusters: MLMarker[];
    radiusShown: number; raf: number; seen: Set<string>; prevSel: string | null; pending: (() => void)[];
  }>({ map: null, loaded: false, me: null, label: null, labelEl: null, pins: new Map(), shown: new Set(), clusters: [], radiusShown: 0, raf: 0, seen: new Set(), prevSel: null, pending: [] });

  /** Uslub yuklangach bajariladi (source/layer qo'shish uchun shart) */
  const whenLoaded = (fn: () => void) => { if (st.current.loaded) fn(); else st.current.pending.push(fn); };

  const fit = (b: Bounds | null, ms: number, maxZoom = 16) => {
    const m = st.current.map;
    if (!m || !b) return;
    const { insets } = latest.current;
    m.fitBounds(toML(b), { padding: { top: insets.top, bottom: insets.bottom, left: 18, right: 18 }, duration: ms, maxZoom, essential: true });
  };
  const fitCircle = (animated = true) => {
    const { center, radiusKm, venues } = latest.current;
    const b = radiusKm >= WIDE_RADIUS_KM ? boundsOf([lngLat(center), ...venues.map((v): LngLat => [v.lng, v.lat])], 0.1) : boundsAround(center, radiusKm);
    fit(b, animated ? 1100 : 0);
  };
  const fitAll = () => fit(boundsOf([lngLat(latest.current.center), ...latest.current.venues.map((v): LngLat => [v.lng, v.lat])], 0.14), 1000, 15);
  useImperativeHandle(ref, () => ({ recenter: () => fitCircle(true), fitAll }));

  const setCircle = (km: number) => {
    const s = st.current;
    const { center } = latest.current;
    s.radiusShown = km;
    const poly = polygon(center, km);
    (s.map?.getSource(SRC) as GeoJSONSource | undefined)?.setData(poly);
    if (MAP_DIAG) (window as unknown as { __lkRing?: LngLat[] }).__lkRing = poly.geometry.coordinates[0]; // sinov uchun
    s.label?.setLngLat(lngLat(northOf(center, km)));
  };
  const tweenRadius = (to: number, ms = 900) => {
    const s = st.current;
    cancelAnimationFrame(s.raf);
    const from = s.radiusShown;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      setCircle(Math.max(0.05, from + (to - from) * ease(k)));
      if (k < 1) s.raf = requestAnimationFrame(step);
    };
    s.raf = requestAnimationFrame(step);
  };

  const makePin = (v: VenueListItem, index: number, active: boolean, fresh: boolean) => {
    const el = holder(pinMarkup(v, { active, fresh, index, today: toISODate(new Date()) }));
    el.addEventListener('click', (e) => { e.stopPropagation(); latest.current.onSelect(v.id); });
    const marker = new maplibregl.Marker({ element: el, anchor: 'top-left' }).setLngLat([v.lng, v.lat]);
    return { marker, el, venue: v };
  };

  /** To'qnashayotgan belgilarni jamlash — aniq ekran koordinatalarida (map.project) */
  const refreshClusters = () => {
    const s = st.current; const m = s.map;
    if (!m) return;
    const { venues, selection } = latest.current;
    const items = venues.map((v) => { const p = m.project([v.lng, v.lat]); return { id: v.id, rating: v.rating, lng: v.lng, lat: v.lat, x: p.x, y: p.y }; });
    const groups = clusterPins(items, selection.id);
    for (const c of s.clusters) c.remove();
    s.clusters = [];
    const now = new Set<string>();
    for (const g of groups) {
      if (g.ids.length === 1) {
        const pin = s.pins.get(g.ids[0]);
        if (!pin) continue;
        now.add(g.ids[0]);
        if (!s.shown.has(g.ids[0])) pin.marker.addTo(m);
      } else {
        const el = holder(clusterMarkup(g.ids.length));
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const b = boundsOf(g.ids.map((id): LngLat => { const v = s.pins.get(id)!.venue; return [v.lng, v.lat]; }), 0.35);
          fit(b, 800, 17);
        });
        s.clusters.push(new maplibregl.Marker({ element: el, anchor: 'top-left' }).setLngLat([g.lng, g.lat]).addTo(m));
      }
    }
    for (const id of s.shown) if (!now.has(id)) s.pins.get(id)?.marker.remove();
    s.shown = now;
  };

  /* ── Xaritani yaratish (bir marta) ── */
  useEffect(() => {
    ensureMapStyle();
    const s = st.current;
    const { center, radiusKm } = latest.current;
    let map: MLMap;
    try {
      map = new maplibregl.Map({
        container: host.current!, style: STYLE, center: lngLat(center), zoom: 9, minZoom: 4, maxZoom: 19, maxBounds: UZ_AREA,
        attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false, fadeDuration: 120,
      });
    } catch (e) { latest.current.onFailure(`WebGL: ${String(e)}`); return undefined; }
    s.map = map;
    if (MAP_DIAG) (window as unknown as { __lkMap?: MLMap }).__lkMap = map; // sinov/diagnostika uchun
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    const wide = radiusKm >= WIDE_RADIUS_KM;
    s.labelEl = holder(radiusMarkup(radiusKm));
    s.label = new maplibregl.Marker({ element: s.labelEl, anchor: 'top-left' }).setLngLat(lngLat(northOf(center, radiusKm)));
    s.me = new maplibregl.Marker({ element: holder(meMarkup), anchor: 'top-left' }).setLngLat(lngLat(center)).addTo(map);

    let tileErrors = 0;
    const failTimer = setTimeout(() => { if (!s.loaded) latest.current.onFailure('uslub 12 s ichida yuklanmadi'); }, 12000);
    map.on('error', (e) => {
      if (!s.loaded) { clearTimeout(failTimer); latest.current.onFailure(`uslub xatosi: ${(e as { error?: Error }).error?.message ?? 'noma\'lum'}`); return; }
      tileErrors += 1;
      if (tileErrors >= 6) latest.current.onTileProblem?.(true);
    });
    map.on('data', (e) => { if ((e as { dataType?: string }).dataType === 'source') { tileErrors = 0; latest.current.onTileProblem?.(false); } });
    map.on('load', () => {
      clearTimeout(failTimer);
      s.loaded = true;
      map.addSource(SRC, { type: 'geojson', data: polygon(center, 0.05) });
      map.addLayer({ id: `${SRC}-fill`, type: 'fill', source: SRC, paint: { 'fill-color': WINE, 'fill-opacity': 0.05 } });
      map.addLayer({ id: `${SRC}-line`, type: 'line', source: SRC, paint: { 'line-color': WINE, 'line-width': 2.2, 'line-opacity': 0.85, 'line-dasharray': [2.5, 3] } });
      if (!wide) s.label?.addTo(map);
      for (const fn of s.pending.splice(0)) fn();
      // Kirish animatsiyasi: uzoqdan yaqinlashib, doira kengayadi
      fitCircle(true);
      if (!wide) tweenRadius(radiusKm, 1300);
    });
    let t: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => { clearTimeout(t); t = setTimeout(refreshClusters, 60); };
    map.on('moveend', schedule);
    map.on('zoomend', schedule);

    return () => {
      clearTimeout(failTimer); clearTimeout(t); cancelAnimationFrame(s.raf);
      for (const p of s.pins.values()) p.marker.remove();
      for (const c of s.clusters) c.remove();
      map.remove();
      s.map = null; s.loaded = false; s.pins.clear(); s.shown.clear(); s.clusters = []; s.seen.clear(); s.pending = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Markaz o'zgarsa ── */
  useEffect(() => {
    const s = st.current;
    if (!s.map) return;
    s.me?.setLngLat(lngLat(props.center));
    whenLoaded(() => { setCircle(s.radiusShown || props.radiusKm); fitCircle(true); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.center.lat, props.center.lng]);

  /* ── Radius o'zgarsa ── */
  useEffect(() => {
    const s = st.current;
    if (!s.map) return;
    whenLoaded(() => {
      const m = s.map!;
      const wide = props.radiusKm >= WIDE_RADIUS_KM;
      m.setLayoutProperty(`${SRC}-fill`, 'visibility', wide ? 'none' : 'visible');
      m.setLayoutProperty(`${SRC}-line`, 'visibility', wide ? 'none' : 'visible');
      if (wide) { s.label?.remove(); s.radiusShown = 0; }
      else {
        s.label?.addTo(m);
        const t = s.labelEl?.querySelector('.lk-rl'); if (t) t.textContent = `${props.radiusKm} km`;
        tweenRadius(props.radiusKm);
      }
      fitCircle(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.radiusKm]);

  /* ── To'yxonalar ro'yxati ── */
  useEffect(() => {
    const s = st.current; const m = s.map;
    if (!m) return;
    const ids = new Set(props.venues.map((v) => v.id));
    for (const [id, pin] of s.pins) if (!ids.has(id)) { pin.marker.remove(); s.pins.delete(id); s.shown.delete(id); s.seen.delete(id); }
    props.venues.forEach((v, i) => {
      const ex = s.pins.get(v.id);
      if (ex) { ex.marker.setLngLat([v.lng, v.lat]); ex.venue = v; return; }
      const fresh = !s.seen.has(v.id);
      s.seen.add(v.id);
      const pin = makePin(v, i, v.id === props.selection.id, fresh);
      s.pins.set(v.id, pin);
      setTimeout(() => pin.el.querySelector('.lk-pin')?.classList.remove('is-new'), 900 + Math.min(i, 14) * 70);
    });
    refreshClusters();
    if (props.radiusKm >= WIDE_RADIUS_KM) whenLoaded(() => fitCircle(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.venues]);

  /* ── Tanlov: belgi sakraydi, kamera unga uchadi (padding tufayli bo'sh maydon markaziga keladi) ── */
  useEffect(() => {
    const s = st.current; const m = s.map;
    if (!m) return;
    const { selection, insets } = props;
    const setActive = (id: string, active: boolean) => {
      const pin = s.pins.get(id);
      const node = pin?.el.querySelector<HTMLElement>('.lk-pin');
      if (!pin || !node) return;
      node.classList.remove('is-active');
      void node.offsetWidth; // reflow: sakrash animatsiyasi har tanlovda qayta ishlasin
      if (active) node.classList.add('is-active');
      pin.el.style.zIndex = active ? '10' : '';
    };
    if (s.prevSel && s.prevSel !== selection.id) setActive(s.prevSel, false);
    if (selection.id) {
      setActive(selection.id, true);
      const pin = s.pins.get(selection.id);
      if (pin && selection.pan) {
        // Belgi tepa panel va kartochkalar orasidagi bo'sh joy markaziga kelsin. `easeTo({padding})` ishlatilmaydi:
        // u paddingni kamerada DOIMIY qoldiradi va keyingi fitBounds zoomni ikki baravar pasaytirib yuboradi.
        const p = m.project([pin.venue.lng, pin.venue.lat]);
        const target = m.unproject([p.x, p.y + (insets.bottom - insets.top) / 2]);
        m.easeTo({ center: target, duration: 650, essential: true });
      }
    }
    s.prevSel = selection.id;
    refreshClusters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selection.seq, props.selection.id]);

  return React.createElement('div', { ref: host, className: 'lk-mlmap', style: { position: 'absolute', inset: 0, zIndex: 0, isolation: 'isolate', background: '#EEE7DC' }, 'aria-label': 'To\'yxonalar xaritasi' });
});
