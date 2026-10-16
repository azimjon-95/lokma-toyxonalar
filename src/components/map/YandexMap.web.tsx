import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { YMap, YMapFeature, YMapMarker } from '@yandex/ymaps3-types';
import type { LatLng, VenueListItem } from '../../types';
import { toISODate } from '../../lib/dates';
import { WIDE_RADIUS_KM, northOf } from '../../lib/mapGeo';
import { boundsAround, boundsOf, clusterPins, mercatorPx, ringAround, type Bounds, type LngLat } from '../../lib/mapMath';
import type { YandexApi } from '../../lib/yandex';
import { WINE, clusterMarkup, ensureMapStyle, meMarkup, pinMarkup, radiusMarkup } from './mapStyles';
import type { LeafletMapHandle } from './LeafletMap';

/*
 * ═══ YANDEX MAPS (JS API v3, vektor) ═══
 * LeafletMap bilan bir xil interfeys. Farqi:
 *   • xarita O'ZBEKISTON uchun to'liq (uylar, ko'chalar, transport) — Yandex ma'lumoti;
 *   • UI qatlamlari egallagan joy `margin` bilan beriladi: kamera markazi va chegaralari faqat ko'rinadigan maydonga hisoblanadi;
 *   • radius doirasi — geodezik ko'pburchak (96 nuqta): har nuqta markazdan aynan R km narida.
 * Muvaffaqiyatsiz bo'lsa (kalit/domen/internet) `onFailure` — MapCanvas OSM'ga o'tadi.
 */
export interface YandexMapProps {
  api: YandexApi;
  center: LatLng;
  radiusKm: number;
  venues: VenueListItem[];
  selection: { id: string | null; pan: boolean; seq: number };
  onSelect: (id: string) => void;
  insets: { top: number; bottom: number };
  onTileProblem?: (problem: boolean) => void;
  onFailure: (reason: string) => void;
}

/** O'zbekiston va atrofi (foydalanuvchi uzoqqa chiqib ketmasin) */
const UZ_AREA: Bounds = [[54, 47.5], [75.5, 35.5]];
const ease = (t: number) => 1 - (1 - t) ** 3;
const lngLat = (p: LatLng): LngLat => [p.lng, p.lat];

/** Marker elementi: nol o'lchamli ildiz (Yandex uning chap-yuqori burchagini nuqtaga qo'yadi), ichida CSS bilan markazlangan belgi */
function holder(html: string): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = 'position:relative;width:0;height:0;';
  el.innerHTML = html;
  return el;
}

export const YandexMap = forwardRef<LeafletMapHandle, YandexMapProps>(function YandexMap(props, ref) {
  const host = useRef<HTMLDivElement | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const state = useRef<{
    map: YMap | null;
    circle: YMapFeature | null;
    me: YMapMarker | null;
    label: YMapMarker | null;
    labelEl: HTMLElement | null;
    pins: Map<string, { marker: YMapMarker; el: HTMLElement; venue: VenueListItem }>;
    shown: Set<string>;
    clusters: YMapMarker[];
    radiusShown: number;
    raf: number;
    seen: Set<string>;
    prevSel: string | null;
    healthy: boolean;
  }>({ map: null, circle: null, me: null, label: null, labelEl: null, pins: new Map(), shown: new Set(), clusters: [], radiusShown: 0, raf: 0, seen: new Set(), prevSel: null, healthy: false });

  const fitBounds = (b: Bounds | null, ms: number) => {
    const m = state.current.map;
    if (m && b) m.setLocation({ bounds: b, duration: ms, easing: 'ease-in-out' });
  };

  /** Foydalanuvchi va radius doirasiga uchib moslashish */
  const fitCircle = (animated = true) => {
    const { center, radiusKm, venues } = latest.current;
    const wide = radiusKm >= WIDE_RADIUS_KM;
    const b = wide ? boundsOf([lngLat(center), ...venues.map((v): LngLat => [v.lng, v.lat])], 0.1) : boundsAround(center, radiusKm);
    fitBounds(b, animated ? 1100 : 0);
  };
  const fitAll = () => fitBounds(boundsOf([lngLat(latest.current.center), ...latest.current.venues.map((v): LngLat => [v.lng, v.lat])], 0.14), 1000);
  useImperativeHandle(ref, () => ({ recenter: () => fitCircle(true), fitAll }));

  const setCircle = (km: number) => {
    const st = state.current;
    const { center } = latest.current;
    st.radiusShown = km;
    st.circle?.update({ geometry: { type: 'Polygon', coordinates: [ringAround(center, km)] } });
    st.label?.update({ coordinates: lngLat(northOf(center, km)) });
  };

  const tweenRadius = (to: number, ms = 900) => {
    const st = state.current;
    cancelAnimationFrame(st.raf);
    const from = st.radiusShown;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      setCircle(Math.max(0.05, from + (to - from) * ease(k)));
      if (k < 1) st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
  };

  const makePin = (v: VenueListItem, index: number, active: boolean, fresh: boolean) => {
    const { YMapMarker } = latest.current.api;
    const el = holder(pinMarkup(v, { active, fresh, index, today: toISODate(new Date()) }));
    const marker = new YMapMarker({ coordinates: [v.lng, v.lat], zIndex: active ? 1000 : 10, onClick: () => latest.current.onSelect(v.id) }, el);
    return { marker, el, venue: v };
  };

  /** To'qnashayotgan belgilarni jamlash */
  const refreshClusters = () => {
    const st = state.current; const m = st.map;
    if (!m) return;
    const { venues, selection, api } = latest.current;
    const z = m.zoom;
    const items = venues.map((v) => ({ id: v.id, rating: v.rating, lng: v.lng, lat: v.lat, ...mercatorPx(v.lng, v.lat, z) }));
    const groups = clusterPins(items, selection.id);
    for (const c of st.clusters) m.removeChild(c);
    st.clusters = [];
    const nowShown = new Set<string>();
    for (const g of groups) {
      if (g.ids.length === 1) {
        const pin = st.pins.get(g.ids[0]);
        if (!pin) continue;
        nowShown.add(g.ids[0]);
        if (!st.shown.has(g.ids[0])) m.addChild(pin.marker);
      } else {
        const mk = new api.YMapMarker({
          coordinates: [g.lng, g.lat], zIndex: 200,
          onClick: () => {
            const b = boundsOf(g.ids.map((id): LngLat => { const v = st.pins.get(id)!.venue; return [v.lng, v.lat]; }), 0.35);
            if (b) fitBounds(b, 800);
          },
        }, holder(clusterMarkup(g.ids.length)));
        m.addChild(mk);
        st.clusters.push(mk);
      }
    }
    for (const id of st.shown) if (!nowShown.has(id)) { const pin = st.pins.get(id); if (pin) m.removeChild(pin.marker); }
    st.shown = nowShown;
  };

  /* ── Xaritani yaratish (bir marta) ── */
  useEffect(() => {
    ensureMapStyle();
    const el = host.current!;
    const st = state.current;
    const { api, center, radiusKm, insets } = latest.current;
    const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapFeature, YMapMarker, YMapListener } = api;
    let healthTimer: ReturnType<typeof setTimeout> | undefined;
    let clusterTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      const map = new YMap(el, {
        location: { center: lngLat(center), zoom: 9 },
        behaviors: ['drag', 'scrollZoom', 'pinchZoom', 'dblClick'], // burish/qiyalash yo'q — belgilar tekis qoladi
        margin: [insets.top, 0, insets.bottom, 0],
        zoomRange: { min: 4, max: 19 },
        restrictMapArea: UZ_AREA,
        theme: 'light',
        copyrightsPosition: 'bottom left',
      });
      st.map = map;
      map.addChild(new YMapDefaultSchemeLayer({}));
      map.addChild(new YMapDefaultFeaturesLayer({}));

      // Radius doirasi (geodezik) va yorlig'i
      const wide = radiusKm >= WIDE_RADIUS_KM;
      st.circle = new YMapFeature({
        geometry: { type: 'Polygon', coordinates: [ringAround(center, 0.05)] },
        style: { fill: WINE, fillOpacity: 0.045, stroke: [{ color: WINE, width: 2.2, opacity: 0.85, dash: [7, 9] }], interactive: false, zIndex: 5 },
      });
      st.labelEl = holder(radiusMarkup(radiusKm));
      st.label = new YMapMarker({ coordinates: lngLat(northOf(center, radiusKm)), zIndex: 100 }, st.labelEl);
      if (!wide) { map.addChild(st.circle); map.addChild(st.label); }

      // "Siz" — radar to'lqinlari bilan
      st.me = new YMapMarker({ coordinates: lngLat(center), zIndex: 500 }, holder(meMarkup));
      map.addChild(st.me);

      // Kamera hodisalari: harakat tugagach jamlanma yangilanadi; xarita javob bersa — "sog'lom"
      const scheduleClusters = () => { clearTimeout(clusterTimer); clusterTimer = setTimeout(refreshClusters, 60); };
      const alive = () => { st.healthy = true; latest.current.onTileProblem?.(false); };
      map.addChild(new YMapListener({
        onUpdate: (o) => { alive(); if (!o.mapInAction) scheduleClusters(); },
        onResize: alive,
        onActionEnd: scheduleClusters,
        onStateChanged: alive,
      }));

      // Kirish animatsiyasi: uzoqdan yaqinlashib, doira kengayadi
      const t = setTimeout(() => { fitCircle(true); if (!wide) tweenRadius(radiusKm, 1300); }, 300);
      // Hech qanday hodisa (update/resize/state) kelmasa 12 soniyadan keyin zaxiraga o'tamiz
      healthTimer = setTimeout(() => { if (!st.healthy) latest.current.onFailure('xarita 12 s ichida hodisa bermadi'); }, 12000);
      return () => {
        clearTimeout(t); clearTimeout(healthTimer); clearTimeout(clusterTimer);
        cancelAnimationFrame(st.raf);
        try { map.destroy(); } catch { /* allaqachon yo'q */ }
        st.map = null; st.pins.clear(); st.shown.clear(); st.clusters = []; st.seen.clear();
      };
    } catch (e) {
      latest.current.onFailure(String(e));
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── UI qatlamlari o'lchami o'zgarsa: kamera marginlari ── */
  useEffect(() => { state.current.map?.setMargin([props.insets.top, 0, props.insets.bottom, 0]); }, [props.insets.top, props.insets.bottom]);

  /* ── Markaz (manzil) o'zgarsa ── */
  useEffect(() => {
    const st = state.current;
    if (!st.map) return;
    st.me?.update({ coordinates: lngLat(props.center) });
    setCircle(st.radiusShown || props.radiusKm);
    fitCircle(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.center.lat, props.center.lng]);

  /* ── Radius o'zgarsa: doira silliq o'zgaradi, kamera moslashadi ── */
  useEffect(() => {
    const st = state.current; const m = st.map;
    if (!m || !st.circle || !st.label) return;
    const wide = props.radiusKm >= WIDE_RADIUS_KM;
    const has = st.circle.parent === m;
    if (wide && has) { m.removeChild(st.circle); m.removeChild(st.label); st.radiusShown = 0; }
    if (!wide) {
      if (!has) { st.radiusShown = 0.05; setCircle(0.05); m.addChild(st.circle); m.addChild(st.label); }
      const t = st.labelEl?.querySelector('.lk-rl'); if (t) t.textContent = `${props.radiusKm} km`;
      tweenRadius(props.radiusKm);
    }
    fitCircle(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.radiusKm]);

  /* ── To'yxonalar ro'yxati o'zgarsa belgilarni moslash ── */
  useEffect(() => {
    const st = state.current; const m = st.map;
    if (!m) return;
    const ids = new Set(props.venues.map((v) => v.id));
    for (const [id, pin] of st.pins) if (!ids.has(id)) { if (st.shown.has(id)) m.removeChild(pin.marker); st.pins.delete(id); st.shown.delete(id); st.seen.delete(id); }
    props.venues.forEach((v, i) => {
      const existing = st.pins.get(v.id);
      if (existing) { existing.marker.update({ coordinates: [v.lng, v.lat] }); existing.venue = v; return; }
      const fresh = !st.seen.has(v.id);
      st.seen.add(v.id);
      const pin = makePin(v, i, v.id === props.selection.id, fresh);
      st.pins.set(v.id, pin);
      // Kirish animatsiyasi tugagach "yangi" sinfi olib tashlanadi (qayta qo'shilganda animatsiya takrorlanmasin)
      setTimeout(() => pin.el.querySelector('.lk-pin')?.classList.remove('is-new'), 900 + Math.min(i, 14) * 70);
    });
    refreshClusters();
    if (props.radiusKm >= WIDE_RADIUS_KM) fitCircle(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.venues]);

  /* ── Tanlov: belgi sakraydi, kamera unga uchadi (margin tufayli bo'sh maydon markaziga keladi) ── */
  useEffect(() => {
    const st = state.current; const m = st.map;
    if (!m) return;
    const { selection } = props;
    const setActive = (id: string, active: boolean) => {
      const pin = st.pins.get(id);
      if (!pin) return;
      const node = pin.el.querySelector<HTMLElement>('.lk-pin');
      if (node) {
        node.classList.remove('is-active');
        void node.offsetWidth; // reflow: sakrash animatsiyasi har tanlovda qayta ishlasin
        if (active) node.classList.add('is-active');
      }
      pin.marker.update({ zIndex: active ? 1000 : 10 });
    };
    if (st.prevSel && st.prevSel !== selection.id) setActive(st.prevSel, false);
    if (selection.id) {
      setActive(selection.id, true);
      const pin = st.pins.get(selection.id);
      if (pin && selection.pan) m.setLocation({ center: [pin.venue.lng, pin.venue.lat], duration: 650, easing: 'ease-in-out' });
    }
    st.prevSel = selection.id;
    refreshClusters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selection.seq, props.selection.id]);

  return React.createElement('div', { ref: host, className: 'lk-ymap', style: { position: 'absolute', inset: 0, zIndex: 0, isolation: 'isolate', background: '#EEE7DC' }, 'aria-label': 'To\'yxonalar xaritasi (Yandex)' });
});
