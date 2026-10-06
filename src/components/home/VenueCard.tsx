import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import type { VenueListItem } from '../../types';
import { formatKm, formatNumber } from '../../lib/format';
import { relativeDayLabel, SESSION_LABEL } from '../../lib/dates';
import { useFavorites } from '../../store/favorites';

interface Props {
  venue: VenueListItem;
  onPress: () => void;
}

export const VenueCard = memo(function VenueCard({ venue, onPress }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(venue.id);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={venue.name}>
      <View style={styles.imageWrap}>
        <Image source={venue.photos[0]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
        {venue.next_free && (
          <View style={styles.freeBadge}>
            <View style={styles.dot} />
            <Text style={styles.freeText}>
              Bo‘sh: {relativeDayLabel(venue.next_free.date).toLowerCase()}, {SESSION_LABEL[venue.next_free.session].toLowerCase()}
            </Text>
          </View>
        )}
        <Pressable
          onPress={() => toggle(venue.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={fav ? 'Saralanganlardan olib tashlash' : 'Saralanganlarga qo‘shish'}
          style={styles.favBtn}
        >
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? colors.primary : colors.text} />
        </Pressable>
        <View style={styles.photoCount}>
          <Ionicons name="images-outline" size={13} color={colors.white} />
          <Text style={styles.photoCountText}>{venue.photos_count} surat</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#E8590C" />
            <Text style={styles.ratingText}>{venue.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {venue.district} · {formatKm(venue.distance_km)} · {venue.capacity_min}–{venue.capacity_max} mehmon
        </Text>
        <Text style={styles.price}>
          {formatNumber(venue.price_from)} – {formatNumber(venue.price_to)}{' '}
          <Text style={styles.priceUnit}>so‘m / kishi</Text>
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: spacing[6] },
  pressed: { opacity: 0.92 },
  imageWrap: { height: 230, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.primaryLight },
  freeBadge: {
    position: 'absolute', top: spacing[3], left: spacing[3], flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  freeText: { ...typography.captionMedium, fontSize: 12, color: colors.text },
  favBtn: {
    position: 'absolute', top: 10, right: 10, width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },
  photoCount: {
    position: 'absolute', bottom: spacing[3], left: spacing[3], flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.text, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full,
  },
  photoCountText: { ...typography.captionMedium, fontSize: 12, color: colors.white },
  content: { paddingTop: spacing[3], paddingHorizontal: 2, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[2] },
  name: { ...typography.h3, fontFamily: typography.h1.fontFamily, fontSize: 19, color: colors.text, flex: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { ...typography.bodySemiBold, fontSize: 14, color: colors.text },
  meta: { ...typography.caption, fontSize: 14, color: colors.textSecondary },
  price: { ...typography.bodySemiBold, fontFamily: typography.h1.fontFamily, color: colors.text, marginTop: 2 },
  priceUnit: { ...typography.body, color: colors.textSecondary },
});
