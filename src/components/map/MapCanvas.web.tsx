import React, { Component, Suspense, forwardRef, lazy, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { MAP_PROVIDER, loadYandexMaps, yandexEnabled, type YandexApi } from '../../lib/yandex';
import { LeafletMap, type LeafletMapHandle } from './LeafletMap.web';
import { YandexMap } from './YandexMap.web';
import type { LatLng, VenueListItem } from '../../types';

// MapLibre (~800 KB) faqat kerak bo'lganda yuklanadi — Yandex ishlasa umuman tushmaydi
const MapLibreMap = lazy(() => import('./MapLibreMap.web').then((m) => ({ default: m.MapLibreMap })));

export type MapProvider = 'yandex' | 'maplibre' | 'osm';
export type MapCanvasHandle = LeafletMapHandle;
export interface MapCanvasProps {
  center: LatLng;
  radiusKm: number;
  venues: VenueListItem[];
  selection: { id: string | null; pan: boolean; seq: number };
  onSelect: (id: string) => void;
  insets: { top: number; bottom: number };
  onTileProblem?: (problem: boolean) => void;
  /** Qaysi provayder ishlayotgani va zaxiraga o'tish sabablari (diagnostika) */
  onProvider?: (p: MapProvider, reasons: string[]) => void;
}

/** Lazy chunk yuklanmasa (tarmoq) yoki MapLibre render paytida yiqilsa — keyingi zaxiraga */
class Guard extends Component<{ onError: (e: string) => void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: unknown) { this.props.onError(String(e)); }
  render() { return this.state.failed ? null : this.props.children; }
}

const Blank = () => React.createElement('div', { style: { position: 'absolute', inset: 0, background: '#EEE7DC' }, 'aria-busy': true, 'aria-label': 'Xarita yuklanmoqda' });

/*
 * Xarita provayderlari zanjiri:  Yandex Maps  →  MapLibre + OpenFreeMap (kalitsiz)  →  Leaflet + OSM (WebGL yo'q bo'lsa).
 * Har bosqich muvaffaqiyatsiz bo'lsa keyingisiga AVTOMATIK o'tadi; sabab `onProvider` orqali beriladi.
 *   EXPO_PUBLIC_MAP_PROVIDER = auto | yandex | maplibre | osm
 */
export const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(function MapCanvas({ onProvider, ...props }, ref) {
  const [mode, setMode] = useState<'loading' | MapProvider>(yandexEnabled ? 'loading' : MAP_PROVIDER === 'osm' ? 'osm' : 'maplibre');
  const [api, setApi] = useState<YandexApi | null>(null);
  const [reasons, setReasons] = useState<string[]>(() => (yandexEnabled ? [] : ['Yandex: o\'chirilgan yoki kalit yo\'q']));
  const inner = useRef<MapCanvasHandle>(null);
  useImperativeHandle(ref, () => ({ recenter: () => inner.current?.recenter(), fitAll: () => inner.current?.fitAll() }));

  const fail = useCallback((from: MapProvider, reason: string, next: MapProvider) => {
    // eslint-disable-next-line no-console
    console.warn(`[xarita] ${from} ishlamadi → ${next}: ${reason}`);
    setReasons((r) => [...r, `${from === 'yandex' ? 'Yandex' : from === 'maplibre' ? 'MapLibre' : 'OSM'}: ${reason}`]);
    setMode(next);
  }, []);

  useEffect(() => {
    if (!yandexEnabled) return undefined;
    let alive = true;
    void loadYandexMaps().then(({ api: a, reason }) => {
      if (!alive) return;
      if (a) { setApi(a); setMode('yandex'); } else fail('yandex', reason ?? 'noma\'lum', 'maplibre');
    });
    return () => { alive = false; };
  }, [fail]);

  useEffect(() => { if (mode !== 'loading') onProvider?.(mode, reasons); }, [mode, reasons, onProvider]);

  if (mode === 'loading') return <Blank />;
  if (mode === 'yandex' && api) return <YandexMap ref={inner} api={api} {...props} onFailure={(r) => fail('yandex', r, 'maplibre')} />;
  if (mode === 'maplibre') {
    return (
      <Guard onError={(e) => fail('maplibre', e, 'osm')}>
        <Suspense fallback={<Blank />}>
          <MapLibreMap ref={inner} {...props} onFailure={(r) => fail('maplibre', r, 'osm')} />
        </Suspense>
      </Guard>
    );
  }
  return <LeafletMap ref={inner} {...props} />;
});
