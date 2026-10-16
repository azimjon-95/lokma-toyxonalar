import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontFamily, layout } from '../../theme';
import { formatKm, formatNumber } from '../../lib/format';
import type { VenueListItem } from '../../types';
import { Skeleton } from './Skeleton';

/** Ro'yxatdagi qator (VenueRow) bilan bir xil o'lcham — kontent kelganda hech narsa sakramaydi */
export function VenueRowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={74} height={62} radius={12} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton width={96} height={14} radius={8} />
        <Skeleton width="70%" height={14} />
        <Skeleton width={48} height={11} />
      </View>
      <View style={{ alignItems: 'flex-end', gap: 10 }}>
        <Skeleton width={17} height={17} radius={9} />
        <Skeleton width={78} height={34} radius={14} />
      </View>
    </View>
  );
}

export function VenueListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View accessibilityLabel="Yuklanmoqda" accessibilityRole="progressbar">
      {Array.from({ length: count }, (_, i) => <VenueRowSkeleton key={i} />)}
    </View>
  );
}

/** "Mashhur to'yxona" kartasi o'rni (FeaturedVenueCard: balandligi 122) */
export function FeaturedSkeleton() {
  return (
    <View style={{ marginHorizontal: 16 }}>
      <Skeleton height={122} radius={20} />
    </View>
  );
}

/** Xarita ostidagi kartochka (MapCarousel) o'rni */
export function MapCardSkeleton() {
  const { width } = useWindowDimensions();
  const w = Math.min(width, 720) - 32 - 26;
  return (
    <View style={[styles.mapCard, { width: w }]} accessibilityLabel="Yuklanmoqda" accessibilityRole="progressbar">
      <Skeleton width={92} height={112} radius={16} />
      <View style={{ flex: 1, gap: 10, paddingVertical: 4 }}>
        <Skeleton width="65%" height={16} />
        <Skeleton width="85%" height={12} />
        <Skeleton width="55%" height={12} />
        <View style={{ flex: 1 }} />
        <Skeleton height={34} radius={17} />
      </View>
    </View>
  );
}

/**
 * To'yxona sahifasi yuklanguncha: ro'yxat keshida bor bo'lsa — rasm, nom, narx, masofa DARHOL ko'rinadi,
 * qolgan qismi (statistika, kalendar) skeleton. Foydalanuvchi bosgan zahoti sahifa "ochilgan" bo'ladi.
 */
export function VenuePageSkeleton({ preview, topInset, onBack }: { preview?: VenueListItem; topInset: number; onBack?: () => void }) {
  const heroH = topInset + 156;
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }} accessibilityLabel="Yuklanmoqda" accessibilityRole="progressbar">
      <View style={{ height: heroH, backgroundColor: '#EFE6DC' }}>
        {preview?.photos[0] ? <Image source={preview.photos[0]} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} /> : null}
        <LinearGradient colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0)']} style={[StyleSheet.absoluteFill, { height: topInset + 70 }]} />
        {onBack ? (
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Orqaga" style={[styles.back, { top: topInset + 8 }]}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.sheet}>
        <View style={{ paddingHorizontal: layout.screenPadding, gap: 10 }}>
          {preview ? (
            <PreviewTitle venue={preview} />
          ) : (
            <>
              <Skeleton width="62%" height={26} radius={10} />
              <Skeleton width="45%" height={13} />
            </>
          )}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} width="23.5%" height={64} radius={14} />)}
          </View>
          <Skeleton height={20} width="40%" style={{ marginTop: 14 }} />
          <Skeleton height={260} radius={18} />
          <Skeleton height={56} radius={18} style={{ marginTop: 6 }} />
        </View>
      </View>
    </View>
  );
}

function PreviewTitle({ venue }: { venue: VenueListItem }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.title} numberOfLines={2}>{venue.name}</Text>
      <Text style={styles.sub}>{formatKm(venue.distance_km)} · {formatNumber(venue.price_from)} so‘m dan · ★ {venue.rating.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 10, padding: 8,
    borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: '#F1EBE4',
  },
  mapCard: { flexDirection: 'row', gap: 12, padding: 10, marginHorizontal: 16, marginVertical: 14, backgroundColor: colors.white, borderRadius: 24, shadowColor: '#2a1a20', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  back: { position: 'absolute', left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  sheet: { flex: 1, marginTop: -22, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: colors.white, paddingTop: 20, overflow: 'hidden' },
  title: { fontFamily: fontFamily.extraBold, fontSize: 24, lineHeight: 30, color: colors.text },
  sub: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
});
