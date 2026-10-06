import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, layout, radius, spacing, typography, fontFamily } from '../../src/theme';
import { useVenues } from '../../src/hooks/queries';
import { useLocation } from '../../src/store/location';
import { regionForRadius } from '../../src/lib/geo';
import { formatPinPrice } from '../../src/lib/format';
import { VenuePreview } from '../../src/components/map/VenuePreview';
import { IconButton } from '../../src/components/ui/IconButton';

const RADII = [10, 20, 50];

export default function MapScreen() {
  const router = useRouter();
  const loc = useLocation();
  const mapRef = useRef<MapView>(null);
  const { data: venues = [], isFetching } = useVenues({ sort: 'distance' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => venues.find((v) => v.id === selectedId) ?? venues[0], [venues, selectedId]);

  useEffect(() => {
    mapRef.current?.animateToRegion(regionForRadius(loc.coords, loc.radiusKm), 400);
  }, [loc.coords, loc.radiusKm]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={regionForRadius(loc.coords, loc.radiusKm)}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onPress={() => {}}
      >
        <Circle
          center={{ latitude: loc.coords.lat, longitude: loc.coords.lng }}
          radius={loc.radiusKm * 1000}
          strokeColor="rgba(201,66,10,0.55)"
          fillColor="rgba(201,66,10,0.07)"
          strokeWidth={2}
        />
        {venues.map((v) => {
          const active = v.id === selected?.id;
          return (
            <Marker
              key={v.id}
              coordinate={{ latitude: v.lat, longitude: v.lng }}
              onPress={() => setSelectedId(v.id)}
              tracksViewChanges={false}
              zIndex={active ? 2 : 1}
            >
              <View style={[styles.pin, active && styles.pinActive]}>
                <Text style={[styles.pinText, active && styles.pinTextActive]}>{formatPinPrice(v.price_from)}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="box-none">
        <View style={styles.topRow}>
          <IconButton icon="chevron-back" label="Orqaga" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.shadow} />
          <View style={[styles.title, styles.shadow]}>
            <Text style={styles.titleText}>Atrofimda · {venues.length} ta to‘yxona{isFetching ? '…' : ''}</Text>
            <Text style={styles.titleSub} numberOfLines={1}>{loc.label}</Text>
          </View>
        </View>
        <View style={[styles.segment, styles.shadow]}>
          {RADII.map((r) => (
            <Pressable key={r} onPress={() => loc.setRadiusKm(r)} style={[styles.segBtn, loc.radiusKm === r && styles.segBtnActive]} accessibilityRole="button" accessibilityState={{ selected: loc.radiusKm === r }}>
              <Text style={[styles.segText, loc.radiusKm === r && styles.segTextActive]}>{r} km</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>

      <View style={styles.bottom} pointerEvents="box-none">
        <IconButton
          icon="locate"
          label="Joylashuvimga qaytish"
          color="#2F6BFF"
          size={48}
          style={[styles.locate, styles.shadow]}
          onPress={() => {
            loc.refresh();
            mapRef.current?.animateToRegion(regionForRadius(loc.coords, loc.radiusKm), 400);
          }}
        />
        {selected ? (
          <VenuePreview venue={selected} onOpen={() => router.push({ pathname: '/venue/[slug]', params: { slug: selected.slug } })} />
        ) : (
          <View style={[styles.empty, styles.shadow]}>
            <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.emptyText}>{loc.radiusKm} km ichida to‘yxona topilmadi. Radiusni kattalashtiring.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF0F3' },
  shadow: { shadowColor: '#111318', shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 12, gap: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: spacing[2] },
  title: { flex: 1, backgroundColor: colors.white, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 7 },
  titleText: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, color: colors.text },
  titleSub: { ...typography.caption, fontSize: 12, color: colors.textSecondary },
  segment: { alignSelf: 'flex-start', flexDirection: 'row', backgroundColor: colors.white, borderRadius: 22, padding: 4, gap: 4 },
  segBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18 },
  segBtnActive: { backgroundColor: colors.text },
  segText: { ...typography.captionMedium, fontFamily: fontFamily.bold, color: colors.text },
  segTextActive: { color: colors.white },
  pin: { backgroundColor: colors.white, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  pinActive: { backgroundColor: colors.text, borderColor: colors.text },
  pinText: { ...typography.captionMedium, fontFamily: fontFamily.extraBold, fontSize: 12, color: colors.text },
  pinTextActive: { color: colors.white },
  bottom: { position: 'absolute', left: layout.screenPadding - 4, right: layout.screenPadding - 4, bottom: spacing[4], gap: spacing[3] },
  locate: { alignSelf: 'flex-end' },
  empty: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, borderRadius: 20, padding: spacing[4] },
  emptyText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
});
