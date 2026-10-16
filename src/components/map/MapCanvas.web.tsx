import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { loadYandexMaps, yandexEnabled, type YandexApi } from '../../lib/yandex';
import { LeafletMap, type LeafletMapHandle } from './LeafletMap.web';
import { YandexMap } from './YandexMap.web';
import type { LatLng, VenueListItem } from '../../types';

export type MapCanvasHandle = LeafletMapHandle;
export interface MapCanvasProps {
  center: LatLng;
  radiusKm: number;
  venues: VenueListItem[];
  selection: { id: string | null; pan: boolean; seq: number };
  onSelect: (id: string) => void;
  insets: { top: number; bottom: number };
  onTileProblem?: (problem: boolean) => void;
  /** Qaysi provayder ishlayotgani (UI/analitika uchun) */
  onProvider?: (p: 'yandex' | 'osm') => void;
}

/*
 * Xarita provayderi tanlovi:
 *   kalit bor (EXPO_PUBLIC_YANDEX_MAPS_KEY) → Yandex Maps; yuklanmasa yoki ishlamasa → OSM (Leaflet).
 *   kalit yo'q yoki EXPO_PUBLIC_MAP_PROVIDER=osm → to'g'ridan-to'g'ri OSM.
 */
export const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(function MapCanvas({ onProvider, ...props }, ref) {
  const [mode, setMode] = useState<'loading' | 'yandex' | 'osm'>(yandexEnabled ? 'loading' : 'osm');
  const [api, setApi] = useState<YandexApi | null>(null);
  const inner = useRef<MapCanvasHandle>(null);
  useImperativeHandle(ref, () => ({ recenter: () => inner.current?.recenter(), fitAll: () => inner.current?.fitAll() }));

  useEffect(() => {
    if (!yandexEnabled) return undefined;
    let alive = true;
    void loadYandexMaps().then((a) => {
      if (!alive) return;
      setApi(a);
      setMode(a ? 'yandex' : 'osm');
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => { if (mode !== 'loading') onProvider?.(mode); }, [mode, onProvider]);

  if (mode === 'loading') {
    return React.createElement('div', { style: { position: 'absolute', inset: 0, background: '#EEE7DC' }, 'aria-busy': true, 'aria-label': 'Xarita yuklanmoqda' });
  }
  if (mode === 'yandex' && api) {
    return <YandexMap ref={inner} api={api} {...props} onFailure={() => setMode('osm')} />;
  }
  return <LeafletMap ref={inner} {...props} />;
});
