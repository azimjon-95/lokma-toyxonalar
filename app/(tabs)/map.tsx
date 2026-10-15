// Native (iOS / Android): react-native-maps. Web / Telegram Mini App uchun — map.web.tsx (Leaflet).
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontFamily, typography } from '../../src/theme';
import { useVenues } from '../../src/hooks/queries';
import { useChromeTone } from '../../src/hooks/useChromeTone';
import { useLocation } from '../../src/store/location';
import { TopFog } from '../../src/components/ui/TopFog';
import { MapCarousel } from '../../src/components/map/MapCarousel';
import { RadiusSwitch } from '../../src/components/map/RadiusSwitch';
import { AnimatedCount } from '../../src/components/map/AnimatedCount';
import { WIDE_RADIUS_KM, directionsUrl, northOf } from '../../src/lib/mapGeo';
import { formatPinPrice } from '../../src/lib/format';
import { toISODate } from '../../src/lib/dates';
import type { LatLng, VenueListItem } from '../../src/types';

const RADII = [10, 20, 50];
const ease = (t: number) => 1 - (1 - t) ** 3;

/** Doira radiusi o'zgarganda silliq kengayadi/torayadi */
function useTween(target: number, ms = 900) {
  const [value, setValue] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = from.current;
    const t0 = Date.now();
    let id = 0;
    const tick = () => {
      const k = Math.min(1, (Date.now() - t0) / ms);
      const v = start + (target - start) * ease(k);
      from.current = v;
      setValue(v);
      if (k < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, ms]);
  return value;
}

/** Narx belgisi; tanlanganda kattalashadi (tracksViewChanges faqat o'zgarish paytida yoqiladi — tezlik uchun) */
function Pin({ v, active, today, onPress }: { v: VenueListItem; active: boolean; today: string; onPress: () => void }) {
  const [track, setTrack] = useState(true);
  useEffect(() => {
    setTrack(true);
    const t = setTimeout(() => setTrack(false), 500);
    return () => clearTimeout(t);
  }, [active]);
  const free = v.next_free?.date === today;
  return (
    <Marker coordinate={{ latitude: v.lat, longitude: v.lng }} onPress={onPress} tracksViewChanges={track} zIndex={active ? 10 : 1} anchor={{ x: 0.5, y: 1 }}>
      <View style={styles.pinWrap}>
        <View style={[styles.pin, active && styles.pinOn]}>
          {free ? <View style={styles.freeDot} /> : null}
          <Text style={[styles.pinText, active && styles.pinTextOn]}>{formatPinPrice(v.price_from)}</Text>
        </View>
        <View style={[styles.tip, active && styles.tipOn]} />
      </View>
    </Marker>
  );
}

export default function MapScreen() {
  const router = useRouter();
  const loc = useLocation();
  const insets = useSafeAreaInsets();
  useChromeTone('light');
  const mapRef = useRef<MapView>(null);
  const { data: venues = [], isFetching } = useVenues({ sort: 'distance' });
  const [selId, setSelId] = useState<string | null>(null);
  const [dockH, setDockH] = useState(190);
  const today = useMemo(() => toISODate(new Date()), []);
  const selectedId = venues.some((v) => v.id === selId) ? selId : venues[0]?.id ?? null;
  const wide = loc.radiusKm >= WIDE_RADIUS_KM;
  const shownRadius = useTween(wide ? 0 : loc.radiusKm);
  const topPad = insets.top + 176;

  const fit = useCallback((all = false) => {
    const pts: LatLng[] = all || wide
      ? [loc.coords, ...venues.map((v) => ({ lat: v.lat, lng: v.lng }))]
      : [northOf(loc.coords, loc.radiusKm), northOf(loc.coords, -loc.radiusKm), { lat: loc.coords.lat, lng: loc.coords.lng + loc.radiusKm / (111.32 * Math.cos((loc.coords.lat * Math.PI) / 180)) }, { lat: loc.coords.lat, lng: loc.coords.lng - loc.radiusKm / (111.32 * Math.cos((loc.coords.lat * Math.PI) / 180)) }];
    mapRef.current?.fitToCoordinates(pts.map((p) => ({ latitude: p.lat, longitude: p.lng })), { edgePadding: { top: topPad, bottom: dockH + 24, left: 28, right: 28 }, animated: true });
  }, [loc.coords, loc.radiusKm, wide, venues, topPad, dockH]);

  // Radius / manzil / natijalar o'zgarganda xarita moslashadi
  useEffect(() => { const t = setTimeout(() => fit(false), 120); return () => clearTimeout(t); }, [loc.coords, loc.radiusKm, venues.length, fit]);

  const select = useCallback((id: string, fly: boolean) => {
    setSelId(id);
    const v = venues.find((x) => x.id === id);
    if (v && fly) mapRef.current?.animateCamera({ center: { latitude: v.lat - 0.004, longitude: v.lng } }, { duration: 600 });
  }, [venues]);
  const open = useCallback((v: VenueListItem) => router.push({ pathname: '/venue/[slug]', params: { slug: v.slug } }), [router]);
  const route = useCallback((v: VenueListItem) => { void Linking.openURL(directionsUrl(loc.coords, { lat: v.lat, lng: v.lng })); }, [loc.coords]);
  const nextRadius = RADII.find((r) => r > loc.radiusKm);
  const empty = !isFetching && venues.length === 0;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{ latitude: loc.coords.lat, longitude: loc.coords.lng, latitudeDelta: 0.4, longitudeDelta: 0.4 }}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        showsCompass={false}
      >
        {!wide ? (
          <Circle center={{ latitude: loc.coords.lat, longitude: loc.coords.lng }} radius={shownRadius * 1000} strokeColor="rgba(166,30,77,0.85)" strokeWidth={2} lineDashPattern={[7, 9]} fillColor="rgba(166,30,77,0.05)" />
        ) : null}
        {venues.map((v) => (
          <Pin key={v.id} v={v} active={v.id === selectedId} today={today} onPress={() => select(v.id, true)} />
        ))}
      </MapView>

      <TopFog height={insets.top} tone="light" />

      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.titleCard}>
          <View style={styles.pinIcon}><Ionicons name="location" size={20} color={colors.white} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Atrofimda</Text>
            <Text style={styles.sub} numberOfLines={1}>
              <AnimatedCount value={venues.length} style={styles.count} /> ta to‘yxona · {loc.label}{isFetching ? ' …' : ''}
            </Text>
          </View>
        </View>
        {wide ? (
          <View style={styles.wideChip}><Ionicons name="earth" size={15} color={colors.white} /><Text style={styles.wideText}>Butun O‘zbekiston</Text></View>
        ) : (
          <RadiusSwitch value={loc.radiusKm} options={RADII} onChange={loc.setRadiusKm} />
        )}
      </View>

      <View style={[styles.fabs, { bottom: dockH + 12 }]} pointerEvents="box-none">
        <Fab icon="expand" label="Hammasini ko'rsatish" onPress={() => fit(true)} />
        <Fab icon="locate" label="Joylashuvimga qaytish" color="#2F6BFF" onPress={() => { loc.refresh(); fit(false); }} />
      </View>

      <View style={styles.dock} onLayout={(e) => setDockH(Math.round(e.nativeEvent.layout.height))} pointerEvents="box-none">
        {empty ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.emptyTitle}>{loc.radiusKm} km ichida to‘yxona topilmadi</Text>
              <Text style={styles.emptySub}>Qidiruv doirasini kengaytirib ko‘ring.</Text>
            </View>
            {nextRadius ? <Pressable onPress={() => loc.setRadiusKm(nextRadius)} style={styles.emptyBtn} accessibilityRole="button"><Text style={styles.emptyBtnText}>{nextRadius} km</Text></Pressable> : null}
          </View>
        ) : (
          <MapCarousel venues={venues} selectedId={selectedId} onSelect={(id) => select(id, true)} onOpen={open} onDirections={route} />
        )}
      </View>
    </View>
  );
}

function Fab({ icon, label, onPress, color = colors.text }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.92 }] }]}>
      <Ionicons name={icon} size={22} color={color} />
    </Pressable>
  );
}

const shadow = { shadowColor: '#2a1a20', shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 6 } as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEE7DC' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, gap: 10 },
  titleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, ...shadow },
  pinIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.text },
  count: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary },
  sub: { ...typography.caption, color: colors.textSecondary },
  wideChip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, ...shadow },
  wideText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.white },
  fabs: { position: 'absolute', right: 16, gap: 10 },
  fab: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  empty: { width: '92%', maxWidth: 520, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 22, padding: 16, marginBottom: 16, ...shadow },
  emptyTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.text },
  emptySub: { ...typography.caption, color: colors.textSecondary },
  emptyBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9 },
  emptyBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.white },
  pinWrap: { alignItems: 'center', paddingBottom: 2 },
  pin: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.white, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6, borderWidth: 1.5, borderColor: '#F0E1E6' },
  pinOn: { backgroundColor: colors.primary, borderColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8 },
  pinText: { fontFamily: fontFamily.extraBold, fontSize: 12, color: colors.text },
  pinTextOn: { color: colors.white, fontSize: 13 },
  freeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#1F9D55' },
  tip: { width: 10, height: 10, marginTop: -6, backgroundColor: colors.white, borderRightWidth: 1.5, borderBottomWidth: 1.5, borderColor: '#F0E1E6', transform: [{ rotate: '45deg' }] },
  tipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
