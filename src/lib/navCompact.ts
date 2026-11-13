import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/*
 * PASTKI MENYU IXCHAMLASHI — Lokma Go / Market (lakmago-client: src/lib/scrollCompact.js) bilan BIR XIL qoida (Instagram kabi):
 * pastga scroll → menyu kichrayib pastda turadi; yuqoriga scroll yoki sahifa tepasi → qaytadi.
 * Gisterezis: pastga 18 px / yuqoriga 26 px yig'ilganda; bounce (chegaradan tashqari) e'tiborsiz; qisqa ro'yxatda ixchamlashmaydi.
 * Ekran ro'yxatiga `onScroll={useNavScroll()}` ulanadi; FloatingTabBar `useNavCompact()` bilan o'qiydi.
 */
export const COMPACT_AFTER = 64;
export const DOWN_DIST = 18;
export const UP_DIST = 26;
export const TOP_EPS = 8;
export const MIN_SCROLLABLE = 140;

/** Toza holat mashinasi: step(y, max) → ixchammi. */
export function createCompactTracker() {
  let compact = false;
  let last: number | null = null;
  let dir = 0;
  let acc = 0;
  return function step(y: number, max: number): boolean {
    const m = Math.max(0, max);
    const c = Math.min(Math.max(y, 0), m);
    if (last === null) { last = c; return compact; }
    const dy = c - last;
    last = c;
    if (m < MIN_SCROLLABLE || c <= TOP_EPS) { compact = false; dir = 0; acc = 0; return compact; }
    if (Math.abs(dy) < 1) return compact;
    const d = Math.sign(dy);
    if (d !== dir) { dir = d; acc = 0; }
    acc += dy;
    if (dir > 0 && acc >= DOWN_DIST && c > COMPACT_AFTER) compact = true;
    else if (dir < 0 && -acc >= UP_DIST) compact = false;
    return compact;
  };
}

// Kichik umumiy holat (qo'shimcha kutubxonasiz)
let compactNow = false;
const listeners = new Set<() => void>();
export function setNavCompact(v: boolean) {
  if (v === compactNow) return;
  compactNow = v;
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useNavCompact = (): boolean => useSyncExternalStore(subscribe, () => compactNow, () => false);

/** ScrollView/FlatList `onScroll` uchun; ekran yopilganda menyu qaytadi. `scrollEventThrottle={16}` tavsiya etiladi. */
export function useNavScroll(extra?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void) {
  const tracker = useRef(createCompactTracker()).current;
  const extraRef = useRef(extra);
  extraRef.current = extra;
  useEffect(() => () => setNavCompact(false), []);
  return useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    setNavCompact(tracker(contentOffset.y, contentSize.height - layoutMeasurement.height));
    extraRef.current?.(e);
  }, [tracker]);
}
