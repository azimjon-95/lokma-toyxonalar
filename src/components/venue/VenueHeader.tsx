import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import { formatKm, formatNumber } from '../../lib/format';

/** Nom, manzil, masofa · narx va reyting (to'lqin ostida) */
export function VenueHeader({ name, address, distanceKm, priceFrom, rating, reviews }: {
  name: string; address: string; distanceKm: number; priceFrom: number; rating: number; reviews: number;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <LinearGradient colors={[colors.goldLight, colors.goldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.badge}>
          <MaterialCommunityIcons name="bank-outline" size={22} color={colors.white} />
        </LinearGradient>
        <Text style={styles.name} numberOfLines={2} accessibilityRole="header">{name}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="location" size={20} color="#8A8178" style={{ marginTop: 1 }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.address} numberOfLines={2}>{address}</Text>
          <Text style={styles.sub}>{formatKm(distanceKm)} · {formatNumber(priceFrom)} so‘m dan</Text>
        </View>
        <View style={styles.rating} accessibilityLabel={`Reyting ${rating.toFixed(1)}, ${reviews} ta sharh`}>
          <Ionicons name="star" size={17} color={colors.goldMid} />
          <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
          <Text style={styles.reviews}>({reviews})</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 18, gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#8A6020', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  name: { flex: 1, fontFamily: fontFamily.serif, fontSize: 27, lineHeight: 32, color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  address: { fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 18, color: '#6F665E' },
  sub: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18, color: '#8A8178', marginTop: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 1 },
  ratingValue: { fontFamily: fontFamily.semiBold, fontSize: 17, color: colors.text },
  reviews: { fontFamily: fontFamily.regular, fontSize: 13, color: '#8A8178' },
});
