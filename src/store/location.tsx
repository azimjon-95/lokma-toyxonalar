import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { DEFAULT_LOCATION, DEFAULT_RADIUS_KM } from '../config/env';
import { distanceKm } from '../lib/geo';
import type { LatLng } from '../types';
import { useLokma, type LokmaAddress } from '../lib/lokma';
import { ALL_RADIUS_KM, UZ_CENTER, type Region } from '../lib/regions';

type Status = 'locating' | 'ready' | 'denied' | 'error';

/*
 * Qayerdagi to'yxonalar ko'rsatiladi:
 *   gps     — telefon joylashuvi (oddiy rejim)
 *   address — Lokma'dagi saqlangan manzil (Lokma ichida — standart)
 *   region  — tanlangan hudud (masalan, tug'ilgan joy)
 *   all     — butun O'zbekiston
 */
export type PlaceKind = 'gps' | 'address' | 'region' | 'all';
export type PlacePick =
  | { kind: 'gps' }
  | { kind: 'address'; address: LokmaAddress }
  | { kind: 'region'; region: Region }
  | { kind: 'all' };

interface LocationValue {
  coords: LatLng;
  label: string;
  status: Status;
  isFallback: boolean;
  radiusKm: number;
  setRadiusKm: (km: number) => void;
  refresh: () => void;
  /** Joriy tanlov turi va (address/region bo'lsa) id */
  place: { kind: PlaceKind; id?: string };
  setPlace: (p: PlacePick) => void;
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
  const lokma = useLokma();
  const [place, setPlaceState] = useState<{ kind: PlaceKind; id?: string }>({ kind: 'gps' });
  // GPS kuzatuvi faqat 'gps' rejimida yangilaydi (qo'lda tanlangan joyni bosib ketmasin)
  const placeRef = useRef<PlaceKind>('gps');

  const apply = useCallback(async (c: LatLng) => {
    if (placeRef.current !== 'gps') return;
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
    placeRef.current = 'gps';
    setPlaceState({ kind: 'gps' });
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

  const setPlace = useCallback((p: PlacePick) => {
    if (p.kind === 'gps') { start(); return; }
    watcher.current?.remove();
    watcher.current = null;
    placeRef.current = p.kind;
    setIsFallback(false);
    setStatus('ready');
    if (p.kind === 'address') {
      const a = p.address;
      setCoords({ lat: a.lat as number, lng: a.lng as number });
      setLabel(a.title || a.address || 'Mening manzilim');
      setPlaceState({ kind: 'address', id: a.id });
      setRadiusKm((r) => (r > 100 ? DEFAULT_RADIUS_KM : r));
    } else if (p.kind === 'region') {
      setCoords({ lat: p.region.lat, lng: p.region.lng });
      setLabel(p.region.name);
      setPlaceState({ kind: 'region', id: p.region.id });
      setRadiusKm(p.region.radiusKm);
    } else {
      setCoords(UZ_CENTER);
      setLabel('Butun O‘zbekiston');
      setPlaceState({ kind: 'all' });
      setRadiusKm(ALL_RADIUS_KM);
    }
  }, [start]);

  /*
   * Boshlanish: Lokma ichida — Lokma'dagi standart manzil (GPS so'ralmaydi,
   * mijoz manzilini allaqachon kiritgan). Manzil bo'lmasa yoki oddiy saytda — GPS.
   */
  const started = useRef(false);
  useEffect(() => {
    if (started.current || !lokma.settled) return;
    started.current = true;
    if (lokma.defaultAddress) setPlace({ kind: 'address', address: lokma.defaultAddress });
    else start();
  }, [lokma.settled, lokma.defaultAddress, setPlace, start]);
  useEffect(() => () => watcher.current?.remove(), []);

  const value = useMemo(
    () => ({ coords, label, status, isFallback, radiusKm, setRadiusKm, refresh: start, place, setPlace }),
    [coords, label, status, isFallback, radiusKm, start, place, setPlace],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocation() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLocation LocationProvider ichida ishlatilishi kerak');
  return v;
}
