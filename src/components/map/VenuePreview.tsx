import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, fontFamily } from '../../theme';
import type { VenueListItem } from '../../types';
import { formatKm, formatNumber } from '../../lib/format';
import { relativeDayLabel, SESSION_LABEL } from '../../lib/dates';

export function VenuePreview({ venue, onOpen }: { venue: VenueListItem; onOpen: () => void }) {
  return (
    <Pressable onPress={onOpen} style={styles.card} accessibilityRole="button" accessibilityLabel={`${venue.name}ni ochish`}>
      <Image source={venue.photos[0]} style={styles.photo} contentFit="cover" />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={13} color="#E8590C" />
            <Text style={styles.ratingText}>{venue.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.meta}>{formatKm(venue.distance_km)} · {venue.capacity_min}–{venue.capacity_max} mehmon</Text>
        {venue.next_free && (
          <Text style={styles.free}>● Bo‘sh: {relativeDayLabel(venue.next_free.date).toLowerCase()}, {SESSION_LABEL[venue.next_free.session].toLowerCase()}</Text>
        )}
        <View style={[styles.row, { marginTop: 'auto' }]}>
          <Text style={styles.price}>
            {formatNumber(venue.price_from)} <Text style={styles.unit}>so‘m dan</Text>
          </Text>
          <View style={styles.open}><Text style={styles.openText}>Ochish</Text></View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: spacing[3], padding: spacing[3], backgroundColor: colors.white, borderRadius: radius.cardLg,
    shadowColor: '#111318', shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  photo: { width: 104, height: 120, borderRadius: 18, backgroundColor: colors.primaryLight },
  body: { flex: 1, gap: 3, paddingTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { ...typography.bodySemiBold, fontFamily: fontFamily.extraBold, fontSize: 17, color: colors.text, flex: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { ...typography.captionMedium, color: colors.text },
  meta: { ...typography.caption, color: colors.textSecondary },
  free: { ...typography.captionMedium, fontSize: 12, color: '#1F7A47' },
  price: { ...typography.bodySemiBold, fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.text },
  unit: { fontFamily: fontFamily.regular, color: colors.textSecondary },
  open: { backgroundColor: colors.primary, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  openText: { ...typography.captionMedium, color: colors.white },
});
