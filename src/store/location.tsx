import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { DEFAULT_LOCATION, DEFAULT_RADIUS_KM } from '../config/env';
import { distanceKm } from '../lib/geo';
import type { LatLng } from '../types';

type Status = 'locating' | 'ready' | 'denied' | 'error';

interface LocationValue {
  coords: LatLng;
  label: string;
  status: Status;
  isFallback: boolean;
  radiusKm: number;
  setRadiusKm: (km: number) => void;
  refresh: () => void;
}

const Ctx = createContext<LocationValue | null>(null);

async function labelFor(c: LatLng): Promise<string> {
  if (Platform.OS === 'web') return 'Joriy joylashuv';
  try {
    const [a] = await Location.reverseGeocodeAsync({ latitude: c.lat, longitude: c.lng });
    const district = a?.district || a?.subregion || a?.street;
    const city = a?.city || a?.region;
    return [district, city].filter(Boolean).join(', ') || 'Joriy joylashuv';
  } catch {
    return 'Joriy joylashuv';
  }
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<LatLng>({ lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng });
  const [label, setLabel] = useState(DEFAULT_LOCATION.label);
  const [status, setStatus] = useState<Status>('locating');
  const [isFallback, setIsFallback] = useState(true);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const watcher = useRef<Location.LocationSubscription | null>(null);
  const lastLabelAt = useRef<LatLng | null>(null);

  const apply = useCallback(async (c: LatLng) => {
    setCoords(c);
    setIsFallback(false);
    setStatus('ready');
    // Manzil nomini faqat 1 km dan ko'p siljiganda yangilaymiz
    if (!lastLabelAt.current || distanceKm(lastLabelAt.current, c) > 1) {
      lastLabelAt.current = c;
      setLabel(await labelFor(c));
    }
  }, []);

  const start = useCallback(async () => {
    setStatus('locating');
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('denied');
        setIsFallback(true);
        setLabel(DEFAULT_LOCATION.label);
        return;
      }
      const last = await Location.getLastKnownPositionAsync().catch(() => null);
      if (last) await apply({ lat: last.coords.latitude, lng: last.coords.longitude });
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await apply({ lat: pos.coords.latitude, lng: pos.coords.longitude });

      watcher.current?.remove();
      watcher.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 1000 },
        (p) => apply({ lat: p.coords.latitude, lng: p.coords.longitude }),
      );
    } catch {
      setStatus((s) => (s === 'ready' ? s : 'error'));
    }
  }, [apply]);

  useEffect(() => {
    start();
    return () => watcher.current?.remove();
  }, [start]);

  const value = useMemo(
    () => ({ coords, label, status, isFallback, radiusKm, setRadiusKm, refresh: start }),
    [coords, label, status, isFallback, radiusKm, start],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocation() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLocation LocationProvider ichida ishlatilishi kerak');
  return v;
}
