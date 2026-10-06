import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, spacing, radius, typography, layout } from '../../src/theme';
import { mockVenues } from '../../src/data/mockVenues';
import { Button } from '../../src/components/ui/Button';

const { width } = Dimensions.get('window');

const RADII = [10, 20, 50];

export default function MapScreen() {
  const router = useRouter();
  const [radiusKm, setRadiusKm] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(mockVenues[0]?.id);

  const selected = mockVenues.find((v) => v.id === selectedId) || mockVenues[0];

  const region = {
    latitude: 41.2856,
    longitude: 69.2034,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
      >
        <Circle
          center={{ latitude: region.latitude, longitude: region.longitude }}
          radius={radiusKm * 1000}
          strokeColor={colors.primary}
          fillColor={colors.mapRadius}
          strokeWidth={1.5}
        />
        {mockVenues.map((v) => (
          <Marker
            key={v.id}
            coordinate={{ latitude: v.lat, longitude: v.lng }}
            onPress={() => setSelectedId(v.id)}
          >
            <View
              style={[
                styles.pin,
                selectedId === v.id && styles.pinSelected,
              ]}
            >
              <Text style={[styles.pinText, selectedId === v.id && styles.pinTextSelected]}>
                {Math.round((v.price_from || 0) / 1000)}k
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <View style={styles.topContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.topInfo}>
            <Text style={styles.topTitle}>Atrofimda · {mockVenues.length} ta to'yxona</Text>
            <Text style={styles.topSub}>Chilonzor, Toshkent</Text>
          </View>
        </View>

        {/* Radius switcher */}
        <View style={styles.radiusRow}>
          {RADII.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusBtn, radiusKm === r && styles.radiusBtnActive]}
              onPress={() => setRadiusKm(r)}
            >
              <Text style={[styles.radiusText, radiusKm === r && styles.radiusTextActive]}>
                {r} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      {/* My location button */}
      <TouchableOpacity style={styles.myLocation}>
        <Ionicons name="locate" size={22} color={colors.mapButton} />
      </TouchableOpacity>

      {/* Bottom card */}
      {selected && (
        <View style={styles.bottomCard}>
          <View style={styles.cardImage}>
            <Ionicons name="business-outline" size={32} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardName}>{selected.name}</Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{selected.rating}</Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>
              {selected.distance_km} km · {selected.capacity_min}–{selected.capacity_max} mehmon
            </Text>
            <View style={styles.cardFree}>
              <View style={styles.greenDot} />
              <Text style={styles.cardFreeText}>{selected.next_free_session}</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardPrice}>
                {selected.price_from?.toLocaleString()} so'm dan
              </Text>
              <Button
                title="Ochish"
                size="sm"
                onPress={() => router.push(`/venue/${selected.slug}`)}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: layout.screenPadding,
  },
  topContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing[2],
    gap: spacing[2],
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topInfo: {
    flex: 1,
  },
  topTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  topSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  radiusRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    padding: 4,
    marginTop: spacing[3],
    gap: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  radiusBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  radiusBtnActive: {
    backgroundColor: colors.text,
  },
  radiusText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  radiusTextActive: {
    color: colors.white,
  },
  pin: {
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pinSelected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  pinText: {
    ...typography.captionMedium,
    color: colors.text,
    fontSize: 12,
  },
  pinTextSelected: {
    color: colors.white,
  },
  myLocation: {
    position: 'absolute',
    right: 16,
    bottom: 220,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    flexDirection: 'row',
    padding: spacing[3],
    gap: spacing[3],
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    ...typography.captionMedium,
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardFree: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  cardFreeText: {
    ...typography.caption,
    color: colors.success,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardPrice: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
});
