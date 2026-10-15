// Native uchun o'rinbosar: web'da `LeafletMap.web.tsx` ishlatiladi, native'da xarita — react-native-maps (app/(tabs)/map.tsx).
import type { LatLng, VenueListItem } from '../../types';

export interface LeafletMapHandle {
  recenter: () => void;
  fitAll: () => void;
}

export interface LeafletMapProps {
  center: LatLng;
  radiusKm: number;
  venues: VenueListItem[];
  selection: { id: string | null; pan: boolean; seq: number };
  onSelect: (id: string) => void;
  insets: { top: number; bottom: number };
  onTileProblem?: (problem: boolean) => void;
}

export const LeafletMap = (_props: LeafletMapProps & { ref?: React.Ref<LeafletMapHandle> }) => null;
