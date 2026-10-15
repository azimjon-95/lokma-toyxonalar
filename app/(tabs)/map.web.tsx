// Web / Telegram Mini App: haqiqiy xarita (Leaflet). Native versiya — map.tsx (react-native-maps).
import React, { useCallback, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontFamily, typography } from '../../src/theme';
import { useVenues } from '../../src/hooks/queries';
import { useChromeTone } from '../../src/hooks/useChromeTone';
import { useLocation } from '../../src/store/location';
import { TopFog } from '../../src/components/ui/TopFog';
import { LeafletMap, type LeafletMapHandle } from '../../src/components/map/LeafletMap';
import { MapCarousel } from '../../src/components/map/MapCarousel';
import { RadiusSwitch } from '../../src/components/map/RadiusSwitch';
import { AnimatedCount } from '../../src/components/map/AnimatedCount';
import { WIDE_RADIUS_KM, directionsUrl } from '../../src/lib/mapGeo';
import type { VenueListItem } from '../../src/types';

const RADII = [10, 20, 50];

export default function MapWeb() {
  const router = useRouter();
  const loc = useLocation();
  const insets = useSafeAreaInsets();
  useChromeTone('light');
  const { data: venues = [], isLoading, isFetching } = useVenues({ sort: 'distance' });
  const mapRef = useRef<LeafletMapHandle>(null);
  const [sel, setSel] = useState<{ id: string | null; pan: boolean; seq: number }>({ id: null, pan: false, seq: 0 });
  const [dockH, setDockH] = useState(190);
  const [tileProblem, setTileProblem] = useState(false);

  // Tanlangan to'yxona ro'yxatda bo'lmasa (radius almashdi) — eng yaqini
  const selectedId = venues.some((v) => v.id === sel.id) ? sel.id : venues[0]?.id ?? null;
  const select = useCallback((id: string) => setSel((s) => ({ id, pan: true, seq: s.seq + 1 })), []);
  const open = useCallback((v: VenueListItem) => router.push({ pathname: '/venue/[slug]', params: { slug: v.slug } }), [router]);
  const route = useCallback((v: VenueListItem) => { void Linking.openURL(directionsUrl(loc.coords, { lat: v.lat, lng: v.lng })); }, [loc.coords]);

  const wide = loc.radiusKm >= WIDE_RADIUS_KM;
  const topInset = insets.top + 176;
  const nextRadius = RADII.find((r) => r > loc.radiusKm);
  const empty = !isLoading && !isFetching && venues.length === 0;

  return (
    <View style={styles.container}>
      <LeafletMap
        ref={mapRef}
        center={loc.coords}
        radiusKm={loc.radiusKm}
        venues={venues}
        selection={{ id: selectedId, pan: sel.pan && selectedId === sel.id, seq: sel.seq }}
        onSelect={select}
        insets={{ top: topInset, bottom: dockH + 24 }}
        onTileProblem={setTileProblem}
      />

      <TopFog height={insets.top} tone="light" />

      {/* Tepa panel */}
      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.titleCard}>
          <View style={styles.pinIcon}><Ionicons name="location" size={20} color={colors.white} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Atrofimda</Text>
            <View style={styles.subRow}>
              <Text style={styles.sub} numberOfLines={1}>
                <AnimatedCount value={venues.length} style={styles.count} /> ta to‘yxona · {loc.label}
              </Text>
              {isFetching ? <View style={styles.live} /> : null}
            </View>
          </View>
        </View>
        {wide ? (
          <View style={styles.wideChip}><Ionicons name="earth" size={15} color={colors.white} /><Text style={styles.wideText}>Butun O‘zbekiston</Text></View>
        ) : (
          <RadiusSwitch value={loc.radiusKm} options={RADII} onChange={loc.setRadiusKm} />
        )}
        {tileProblem ? (
          <View style={styles.warn}><Ionicons name="cloud-offline-outline" size={15} color="#8A5A00" /><Text style={styles.warnText}>Xarita yuklanmadi. Internetni tekshiring.</Text></View>
        ) : null}
      </View>

      {/* Suzuvchi tugmalar */}
      <View style={[styles.fabs, { bottom: dockH + 12 }]} pointerEvents="box-none">
        <Fab icon="expand" label="Hammasini ko'rsatish" onPress={() => mapRef.current?.fitAll()} />
        <Fab icon="locate" label="Joylashuvimga qaytish" color="#2F6BFF" onPress={() => { loc.refresh(); mapRef.current?.recenter(); }} />
      </View>

      {/* Pastki kartochkalar */}
      <View style={styles.dock} onLayout={(e) => setDockH(Math.round(e.nativeEvent.layout.height))} pointerEvents="box-none">
        {empty ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.emptyTitle}>{loc.radiusKm} km ichida to‘yxona topilmadi</Text>
              <Text style={styles.emptySub}>Qidiruv doirasini kengaytirib ko‘ring.</Text>
            </View>
            {nextRadius ? (
              <Pressable onPress={() => loc.setRadiusKm(nextRadius)} style={styles.emptyBtn} accessibilityRole="button"><Text style={styles.emptyBtnText}>{nextRadius} km</Text></Pressable>
            ) : null}
          </View>
        ) : (
          <MapCarousel venues={venues} selectedId={selectedId} onSelect={select} onOpen={open} onDirections={route} />
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
  container: { flex: 1, backgroundColor: '#EEE7DC', overflow: 'hidden' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, gap: 10, zIndex: 30 },
  titleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, ...shadow },
  pinIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.text },
  subRow: { flexDirection: 'row', alignItems: 'center' },
  count: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary },
  sub: { ...typography.caption, color: colors.textSecondary, flexShrink: 1 },
  live: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary, marginLeft: 6, opacity: 0.8 },
  wideChip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, ...shadow },
  wideText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.white },
  warn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF3D6', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  warnText: { fontFamily: fontFamily.medium, fontSize: 12, color: '#8A5A00' },
  fabs: { position: 'absolute', right: 16, gap: 10, zIndex: 30 },
  fab: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30, alignItems: 'center' },
  empty: { width: '92%', maxWidth: 520, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 22, padding: 16, marginBottom: 16, ...shadow },
  emptyTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.text },
  emptySub: { ...typography.caption, color: colors.textSecondary },
  emptyBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9 },
  emptyBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.white },
});
