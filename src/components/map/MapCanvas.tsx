// Native uchun o'rinbosar (faqat tiplar): web'da `MapCanvas.web.tsx`, native'da xarita — react-native-maps (app/(tabs)/map.tsx).
import type { Ref } from 'react';
import type { LeafletMapHandle, LeafletMapProps } from './LeafletMap';

export type MapCanvasHandle = LeafletMapHandle;
export type MapCanvasProps = LeafletMapProps & { onProvider?: (p: 'yandex' | 'osm') => void };
export const MapCanvas = (_props: MapCanvasProps & { ref?: Ref<MapCanvasHandle> }) => null;
