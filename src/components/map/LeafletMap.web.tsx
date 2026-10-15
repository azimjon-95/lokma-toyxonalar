import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng, VenueListItem } from '../../types';
import { formatPinPrice } from '../../lib/format';
import { toISODate } from '../../lib/dates';
import { WIDE_RADIUS_KM, northOf } from '../../lib/mapGeo';
import { colors } from '../../theme';

/*
 * ═══ HAQIQIY XARITA (web / Telegram Mini App) — Leaflet ═══
 *   • markazda — foydalanuvchi manzili ("Siz", radar to'lqinlari bilan);
 *   • tanlangan radius — doira (o'zgarganda silliq kengayadi/torayadi, xarita uchib moslashadi);
 *   • to'yxonalar — aniq koordinatalarda narx belgilari; bir-birini bosib qolsa jamlanadi, bosilsa yaqinlashadi;
 *   • tanlangan to'yxona belgisi sakraydi, xarita unga uchadi (pastdagi kartochkalar bilan bog'liq).
 *
 * Plitkalar: EXPO_PUBLIC_MAP_TILES_URL (standart: CARTO Voyager). Production uchun litsenziyali
 * provayder (MapTiler, Stadia, Mapbox) kalitini shu o'zgaruvchi orqali bering.
 */
const TILES = process.env.EXPO_PUBLIC_MAP_TILES_URL || 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const ATTRIBUTION = process.env.EXPO_PUBLIC_MAP_ATTRIBUTION || '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>';
const WINE = colors.primary;

export interface LeafletMapHandle {
  /** Foydalanuvchi va radius doirasiga qaytish */
  recenter: () => void;
  /** Barcha natijalarni ko'rsatish */
  fitAll: () => void;
}

interface Props {
  center: LatLng;
  radiusKm: number;
  venues: VenueListItem[];
  /** seq o'zgarganda tanlangan to'yxonaga uchiladi (pan=false bo'lsa faqat belgi yangilanadi) */
  selection: { id: string | null; pan: boolean; seq: number };
  onSelect: (id: string) => void;
  /** UI qatlamlari egallagan joy (px) — xarita markazi shu bo'sh joyda hisoblanadi */
  insets: { top: number; bottom: number };
  /** Plitkalar yuklanmasa (internet yo'q) */
  onTileProblem?: (problem: boolean) => void;
}

const CSS = `
.lk-map{position:absolute;inset:0;z-index:0;isolation:isolate;background:#EEE7DC;outline:none;font-family:'Onest_500Medium',system-ui,sans-serif}
.lk-map .leaflet-control-attribution{background:rgba(255,255,255,.78);backdrop-filter:blur(4px);border-radius:8px 8px 0 0;font-size:9px;color:#6b645a;padding:1px 6px;margin:0 0 0 0}
.lk-map .leaflet-control-attribution a{color:#6b645a}
.lk-map .leaflet-tile-pane{filter:saturate(.92) contrast(.98)}
.lk-pin-wrap,.lk-me-wrap,.lk-rl-wrap,.lk-cl-wrap{background:none!important;border:0!important}
.lk-pin{position:absolute;left:0;top:0;transform:translate(-50%,-100%);transform-origin:50% 100%;cursor:pointer;-webkit-tap-highlight-color:transparent;filter:drop-shadow(0 4px 8px rgba(40,20,28,.28))}
.lk-pin-body{display:flex;align-items:center;gap:5px;padding:6px 11px;border-radius:999px;background:#fff;color:#2a1a20;border:1.5px solid #f0e1e6;font:800 12px/1 'Onest_800ExtraBold',system-ui,sans-serif;letter-spacing:.1px;white-space:nowrap;transition:background .2s,color .2s,border-color .2s}
.lk-pin-tip{position:absolute;left:50%;bottom:-5px;width:10px;height:10px;margin-left:-5px;background:#fff;border-right:1.5px solid #f0e1e6;border-bottom:1.5px solid #f0e1e6;transform:rotate(45deg);border-radius:0 0 3px 0;transition:background .2s,border-color .2s}
.lk-pin-free{width:7px;height:7px;border-radius:50%;background:#1f9d55;box-shadow:0 0 0 2px rgba(31,157,85,.22)}
.lk-pin:hover .lk-pin-body{border-color:${WINE}}
.lk-pin.is-new{animation:lk-drop .55s cubic-bezier(.2,1.3,.4,1) both;animation-delay:var(--d,0ms)}
.lk-pin.is-active{z-index:5;animation:lk-bounce .7s cubic-bezier(.2,1.4,.4,1) both}
.lk-pin.is-active .lk-pin-body{background:${WINE};color:#fff;border-color:${WINE};padding:8px 14px;font-size:13px}
.lk-pin.is-active .lk-pin-tip{background:${WINE};border-color:${WINE}}
@keyframes lk-drop{0%{opacity:0;transform:translate(-50%,-190%) scale(.4)}100%{opacity:1;transform:translate(-50%,-100%) scale(1)}}
@keyframes lk-bounce{0%{transform:translate(-50%,-100%) scale(.85)}45%{transform:translate(-50%,-140%) scale(1.18)}100%{transform:translate(-50%,-100%) scale(1.12)}}
.lk-cl{position:absolute;left:0;top:0;transform:translate(-50%,-50%);width:42px;height:42px;border-radius:50%;background:linear-gradient(145deg,#c2365f,${WINE} 55%,#7a1234);color:#fff;display:flex;align-items:center;justify-content:center;font:800 15px/1 'Onest_800ExtraBold',system-ui,sans-serif;border:3px solid #fff;box-shadow:0 6px 16px rgba(122,18,52,.4);cursor:pointer;animation:lk-pop .35s cubic-bezier(.2,1.4,.4,1) both}
.lk-cl::after{content:'';position:absolute;inset:-9px;border-radius:50%;border:2px solid rgba(166,30,77,.25)}
@keyframes lk-pop{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
.lk-me{position:absolute;left:0;top:0;width:0;height:0}
.lk-me-dot{position:absolute;left:-9px;top:-9px;width:18px;height:18px;border-radius:50%;background:#2f6bff;border:3px solid #fff;box-shadow:0 2px 10px rgba(47,107,255,.6);z-index:2}
.lk-me-ring{position:absolute;left:-9px;top:-9px;width:18px;height:18px;border-radius:50%;background:rgba(47,107,255,.35);animation:lk-radar 2.8s cubic-bezier(.2,.6,.3,1) infinite}
.lk-me-ring.r2{animation-delay:1.4s}
@keyframes lk-radar{0%{transform:scale(1);opacity:.7}100%{transform:scale(6.5);opacity:0}}
.lk-me-label{position:absolute;left:0;top:14px;transform:translateX(-50%);background:#2f6bff;color:#fff;font:700 10px/1 'Onest_700Bold',system-ui,sans-serif;padding:3px 7px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 6px rgba(47,107,255,.4)}
.lk-rl{position:absolute;left:0;top:0;transform:translate(-50%,-50%);background:${WINE};color:#fff;font:800 11px/1 'Onest_800ExtraBold',system-ui,sans-serif;padding:5px 9px;border-radius:999px;white-space:nowrap;box-shadow:0 3px 10px rgba(122,18,52,.35);border:2px solid #fff}
`;

function ensureStyle() {
  if (document.getElementById('lk-map-css')) return;
  const s = document.createElement('style');
  s.id = 'lk-map-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const ease = (t: number) => 1 - (1 - t) ** 3;

function pinIcon(v: VenueListItem, o: { active: boolean; fresh: boolean; index: number; today: string }) {
  const free = v.next_free?.date === o.today;
  return L.divIcon({
    className: 'lk-pin-wrap',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    html: `<div class="lk-pin${o.active ? ' is-active' : ''}${o.fresh ? ' is-new' : ''}" style="--d:${Math.min(o.index, 14) * 70}ms" role="button" aria-label="${v.name.replace(/"/g, '')}, ${formatPinPrice(v.price_from)}">
      <div class="lk-pin-body">${free ? '<i class="lk-pin-free"></i>' : ''}<span>${formatPinPrice(v.price_from)}</span></div><i class="lk-pin-tip"></i></div>`,
  });
}

export const LeafletMap = forwardRef<LeafletMapHandle, Props>(function LeafletMap(props, ref) {
  const host = useRef<HTMLDivElement | null>(null);
  const latest = useRef(props);
  latest.current = props;

  const map = useRef<L.Map | null>(null);
  const circle = useRef<L.Circle | null>(null);
  const rLabel = useRef<L.Marker | null>(null);
  const me = useRef<L.Marker | null>(null);
  const pins = useRef(new Map<string, L.Marker>());
  const shown = useRef(new Set<string>());
  const clusters = useRef<L.LayerGroup | null>(null);
  const radiusShown = useRef(0);
  const raf = useRef(0);
  const seenIds = useRef(new Set<string>());

  /** Foydalanuvchi + radius doirasiga uchib moslashish */
  const fitCircle = (animated = true) => {
    const m = map.current;
    if (!m) return;
    const { center, radiusKm, insets, venues } = latest.current;
    const pad = { paddingTopLeft: L.point(18, insets.top) as L.PointExpression, paddingBottomRight: L.point(18, insets.bottom) as L.PointExpression };
    let bounds: L.LatLngBounds;
    if (radiusKm >= WIDE_RADIUS_KM) {
      bounds = L.latLngBounds([[center.lat, center.lng]]);
      for (const v of venues) bounds.extend([v.lat, v.lng]);
      if (!bounds.isValid() || venues.length === 0) bounds = L.latLng(center.lat, center.lng).toBounds(400_000);
    } else {
      bounds = L.latLng(center.lat, center.lng).toBounds(radiusKm * 2000 * 1.06);
    }
    if (animated) m.flyToBounds(bounds, { ...pad, duration: 1.15, easeLinearity: 0.22, maxZoom: 16 });
    else m.fitBounds(bounds, { ...pad, animate: false, maxZoom: 16 });
  };

  const fitAll = () => {
    const m = map.current;
    if (!m) return;
    const { center, venues, insets } = latest.current;
    const b = L.latLngBounds([[center.lat, center.lng]]);
    for (const v of venues) b.extend([v.lat, v.lng]);
    m.flyToBounds(b, { paddingTopLeft: [30, insets.top], paddingBottomRight: [30, insets.bottom], duration: 1.0, maxZoom: 15 });
  };

  useImperativeHandle(ref, () => ({ recenter: () => fitCircle(true), fitAll }));

  /** Doira radiusini silliq o'zgartirish (radar effekti) */
  const tweenRadius = (to: number, ms = 900) => {
    cancelAnimationFrame(raf.current);
    const from = radiusShown.current;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      const r = from + (to - from) * ease(k);
      radiusShown.current = r;
      circle.current?.setRadius(r * 1000);
      const c = latest.current.center;
      rLabel.current?.setLatLng(northOf(c, r));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  /** To'qnashayotgan belgilarni jamlash */
  const refreshClusters = () => {
    const m = map.current;
    if (!m) return;
    const { venues, selection } = latest.current;
    const items = venues.map((v) => ({ v, p: m.latLngToLayerPoint([v.lat, v.lng]) }));
    const used = new Set<string>();
    const groups: { members: typeof items }[] = [];
    // Tanlangan va yuqori reytingli belgilar birinchi bo'lib "yakka" qoladi
    const order = [...items].sort((a, b) => (b.v.id === selection.id ? 1 : 0) - (a.v.id === selection.id ? 1 : 0) || b.v.rating - a.v.rating);
    for (const it of order) {
      if (used.has(it.v.id)) continue;
      used.add(it.v.id);
      const members = [it];
      if (it.v.id !== selection.id) {
        for (const o of order) {
          if (used.has(o.v.id) || o.v.id === selection.id) continue;
          if (Math.abs(o.p.x - it.p.x) < 58 && Math.abs(o.p.y - it.p.y) < 30) { used.add(o.v.id); members.push(o); }
        }
      }
      groups.push({ members });
    }
    clusters.current?.clearLayers();
    const nowShown = new Set<string>();
    for (const g of groups) {
      if (g.members.length === 1) {
        const id = g.members[0].v.id;
        nowShown.add(id);
        const pin = pins.current.get(id);
        if (pin && !m.hasLayer(pin)) pin.addTo(m);
      } else {
        const lat = g.members.reduce((s, x) => s + x.v.lat, 0) / g.members.length;
        const lng = g.members.reduce((s, x) => s + x.v.lng, 0) / g.members.length;
        const mk = L.marker([lat, lng], {
          icon: L.divIcon({ className: 'lk-cl-wrap', iconSize: [0, 0], html: `<div class="lk-cl" role="button" aria-label="${g.members.length} ta to'yxona">${g.members.length}</div>` }),
          keyboard: false,
          zIndexOffset: 200,
        });
        mk.on('click', () => {
          const b = L.latLngBounds(g.members.map((x) => [x.v.lat, x.v.lng] as [number, number]));
          const { insets } = latest.current;
          m.flyToBounds(b, { paddingTopLeft: [60, insets.top], paddingBottomRight: [60, insets.bottom], duration: 0.8, maxZoom: 17 });
        });
        clusters.current?.addLayer(mk);
      }
    }
    for (const id of shown.current) if (!nowShown.has(id)) { const pin = pins.current.get(id); if (pin) m.removeLayer(pin); }
    shown.current = nowShown;
  };

  /* ── Xaritani yaratish (bir marta) ── */
  useEffect(() => {
    ensureStyle();
    const el = host.current!;
    const { center, radiusKm, insets } = latest.current;
    const m = L.map(el, {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 90,
      minZoom: 4,
      maxZoom: 18,
      tap: true,
      bounceAtZoomLimits: false,
      worldCopyJump: false,
    } as L.MapOptions).setView([center.lat, center.lng], 11);
    map.current = m;
    L.control.attribution({ prefix: false, position: 'bottomleft' }).addAttribution(ATTRIBUTION).addTo(m);

    // Plitkalar yuklanmasa foydalanuvchiga aytamiz (internet/CSP)
    let errors = 0;
    let loaded = false;
    const tiles = L.tileLayer(TILES, { subdomains: 'abcd', maxZoom: 19, keepBuffer: 4, updateWhenIdle: false, crossOrigin: true });
    tiles.on('tileload', () => { loaded = true; errors = 0; latest.current.onTileProblem?.(false); });
    tiles.on('tileerror', () => { errors += 1; if (!loaded && errors >= 4) latest.current.onTileProblem?.(true); });
    tiles.addTo(m);

    clusters.current = L.layerGroup().addTo(m);

    // Radius doirasi va yorlig'i
    circle.current = L.circle([center.lat, center.lng], {
      radius: 1, color: WINE, weight: 2.2, opacity: 0.85, dashArray: '7 9', fillColor: WINE, fillOpacity: 0.045, interactive: false,
    }).addTo(m);
    rLabel.current = L.marker(northOf(center, radiusKm), {
      icon: L.divIcon({ className: 'lk-rl-wrap', iconSize: [0, 0], html: `<div class="lk-rl">${radiusKm} km</div>` }),
      interactive: false, keyboard: false, zIndexOffset: 100,
    }).addTo(m);
    if (radiusKm >= WIDE_RADIUS_KM) { circle.current.remove(); rLabel.current.remove(); }

    // "Siz" — radar to'lqinlari bilan
    me.current = L.marker([center.lat, center.lng], {
      icon: L.divIcon({ className: 'lk-me-wrap', iconSize: [0, 0], html: '<div class="lk-me"><i class="lk-me-ring"></i><i class="lk-me-ring r2"></i><i class="lk-me-dot"></i><span class="lk-me-label">Siz</span></div>' }),
      interactive: false, keyboard: false, zIndexOffset: 500,
    }).addTo(m);

    // Kirish animatsiyasi: uzoqdan yaqinlashib, doira kengayadi
    m.invalidateSize();
    fitCircle(false);
    m.setZoom(m.getZoom() - 1.5, { animate: false });
    const t = setTimeout(() => { fitCircle(true); if (radiusKm < WIDE_RADIUS_KM) tweenRadius(radiusKm, 1300); }, 250);

    const ro = new ResizeObserver(() => m.invalidateSize({ pan: false }));
    ro.observe(el);
    m.on('zoomend moveend', refreshClusters);
    void insets;

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf.current);
      ro.disconnect();
      m.remove();
      map.current = null;
      pins.current.clear();
      shown.current.clear();
      seenIds.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Markaz o'zgarsa (manzil almashdi) ── */
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    me.current?.setLatLng([props.center.lat, props.center.lng]);
    circle.current?.setLatLng([props.center.lat, props.center.lng]);
    rLabel.current?.setLatLng(northOf(props.center, radiusShown.current || props.radiusKm));
    fitCircle(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.center.lat, props.center.lng]);

  /* ── Radius o'zgarsa: doira silliq o'zgaradi, xarita moslashadi ── */
  useEffect(() => {
    const m = map.current;
    if (!m || !circle.current || !rLabel.current) return;
    const wide = props.radiusKm >= WIDE_RADIUS_KM;
    if (wide) { circle.current.remove(); rLabel.current.remove(); radiusShown.current = 0; }
    else {
      if (!m.hasLayer(circle.current)) { circle.current.addTo(m); rLabel.current.addTo(m); radiusShown.current = 0; }
      (rLabel.current.getElement()?.querySelector('.lk-rl') as HTMLElement | null)?.replaceChildren(`${props.radiusKm} km`);
      tweenRadius(props.radiusKm);
    }
    fitCircle(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.radiusKm]);

  /* ── To'yxonalar ro'yxati o'zgarsa belgilarni moslash ── */
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const today = toISODate(new Date());
    const ids = new Set(props.venues.map((v) => v.id));
    for (const [id, pin] of pins.current) if (!ids.has(id)) { m.removeLayer(pin); pins.current.delete(id); shown.current.delete(id); seenIds.current.delete(id); }
    props.venues.forEach((v, i) => {
      const active = v.id === props.selection.id;
      const existing = pins.current.get(v.id);
      if (existing) { existing.setLatLng([v.lat, v.lng]); return; }
      const fresh = !seenIds.current.has(v.id);
      seenIds.current.add(v.id);
      const pin = L.marker([v.lat, v.lng], { icon: pinIcon(v, { active, fresh, index: i, today }), riseOnHover: true, keyboard: true, title: v.name, zIndexOffset: active ? 1000 : 0 });
      pin.on('click', () => latest.current.onSelect(v.id));
      pins.current.set(v.id, pin);
      // Kirish animatsiyasi tugagach oddiy belgiga almashtiramiz (qayta tiklanganda animatsiya takrorlanmasin)
      setTimeout(() => { if (pins.current.get(v.id) === pin) pin.setIcon(pinIcon(v, { active: latest.current.selection.id === v.id, fresh: false, index: i, today })); }, 900 + Math.min(i, 14) * 70);
    });
    refreshClusters();
    if (props.radiusKm >= WIDE_RADIUS_KM) fitCircle(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.venues]);

  /* ── Tanlov: belgi sakraydi, xarita unga uchadi ── */
  const prevSel = useRef<string | null>(null);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const today = toISODate(new Date());
    const { selection, venues } = props;
    const idxOf = (id: string) => venues.findIndex((v) => v.id === id);
    const prev = prevSel.current;
    if (prev && prev !== selection.id) {
      const pin = pins.current.get(prev); const v = venues.find((x) => x.id === prev);
      if (pin && v) { pin.setIcon(pinIcon(v, { active: false, fresh: false, index: idxOf(prev), today })); pin.setZIndexOffset(0); }
    }
    if (selection.id) {
      const pin = pins.current.get(selection.id); const v = venues.find((x) => x.id === selection.id);
      if (pin && v) {
        pin.setIcon(pinIcon(v, { active: true, fresh: false, index: idxOf(selection.id), today }));
        pin.setZIndexOffset(1000);
        if (!m.hasLayer(pin)) pin.addTo(m);
        if (selection.pan) {
          // Zoom o'zgarmaydi (radius ko'rinishi saqlanadi); belgi tepa panel va kartochkalar orasidagi bo'sh joyga keladi
          const z = m.getZoom();
          const p = m.project([v.lat, v.lng], z);
          p.y += (props.insets.bottom - props.insets.top) / 2;
          const target = m.unproject(p, z);
          const size = m.getSize();
          const far = m.latLngToContainerPoint(target).distanceTo(L.point(size.x / 2, size.y / 2)) > Math.max(size.x, size.y);
          if (far) m.flyTo(target, z, { duration: 0.9, easeLinearity: 0.25 });
          else m.panTo(target, { animate: true, duration: 0.6, easeLinearity: 0.3 });
        }
      }
    }
    prevSel.current = selection.id;
    refreshClusters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selection.seq, props.selection.id]);

  return React.createElement('div', { ref: host, className: 'lk-map', 'aria-label': 'To\'yxonalar xaritasi' });
});
