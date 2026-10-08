import React, { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, fontFamily } from '../../theme';
import type { VenueListItem } from '../../types';
import { formatKm, formatNumber } from '../../lib/format';
import { relativeDayLabel, SESSION_LABEL } from '../../lib/dates';
import { useFavorites } from '../../store/favorites';

/*
 * To'yxona kartasi — "3D" yumshoq ko'tarilgan karta:
 *   oq asos + ikki qatlamli yumshoq soya (yaqin + uzoq), rasm ustida
 *   pastdan qorong'ilashuv, nom va narx alohida panelda.
 * Bosilganda biroz cho'kadi (mobil ilovalardagidek).
 */
interface Props {
  venue: VenueListItem;
  onPress: () => void;
}

export const VenueCard = memo(function VenueCard({ venue, onPress }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(venue.id);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={venue.name}
    >
      <View style={styles.imageWrap}>
        <Image source={venue.photos[0]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
        {/* Pastdan qorong'ilashuv — oq yozuvlar har qanday rasmda o'qiladi */}
        <View style={styles.shade} pointerEvents="none" />

        {venue.next_free && (
          <View style={styles.freeBadge}>
            <View style={styles.dot} />
            <Text style={styles.freeText} numberOfLines={1}>
              Bo‘sh: {relativeDayLabel(venue.next_free.date).toLowerCase()}, {SESSION_LABEL[venue.next_free.session].toLowerCase()}
            </Text>
          </View>
        )}
        <Pressable
          onPress={() => toggle(venue.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={fav ? 'Saralanganlardan olib tashlash' : 'Saralanganlarga qo‘shish'}
          style={({ pressed }) => [styles.favBtn, pressed && { transform: [{ scale: 0.9 }] }]}
        >
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={19} color={fav ? colors.primary : colors.text} />
        </Pressable>

        <View style={styles.bottomRow}>
          <View style={styles.glass}>
            <Ionicons name="images-outline" size={12} color={colors.white} />
            <Text style={styles.glassText}>{venue.photos_count}</Text>
          </View>
          <View style={styles.glass}>
            <Ionicons name="navigate" size={11} color={colors.white} />
            <Text style={styles.glassText}>{formatKm(venue.distance_km)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={13} color={colors.gold} />
            <Text style={styles.ratingText}>{venue.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.meta} numberOfLines={1}>{venue.district}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.meta} numberOfLines={1}>{venue.capacity_min}–{venue.capacity_max}</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price} numberOfLines={1}>
            {formatNumber(venue.price_from)}
            <Text style={styles.priceDash}> – </Text>
            {formatNumber(venue.price_to)}
          </Text>
          <View style={styles.pricePill}>
            <Text style={styles.pricePillText}>so‘m / kishi</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

// Ikki qatlamli yumshoq soya: vebda haqiqiy CSS, mobilda shadow*/elevation
const CARD_SHADOW = Platform.select({
  web: { boxShadow: '0 1px 2px rgba(42, 15, 28, 0.06), 0 12px 28px -10px rgba(42, 15, 28, 0.22)' } as object,
  default: { shadowColor: '#2A0F1C', shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
});

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[5],
    backgroundColor: colors.white,
    borderRadius: radius.card,
    ...CARD_SHADOW,
  },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.97 },
  imageWrap: {
    height: 208, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card,
    overflow: 'hidden', backgroundColor: colors.primaryLight,
  },
  shade: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 90,
    ...(Platform.OS === 'web'
      ? ({ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.42), rgba(0,0,0,0))' } as object)
      : { backgroundColor: 'rgba(0,0,0,0.12)' }),
  },
  freeBadge: {
    position: 'absolute', top: 12, left: 12, maxWidth: '72%', flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.full,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  freeText: { ...typography.captionMedium, fontSize: 12, color: colors.text, flexShrink: 1 },
  favBtn: {
    position: 'absolute', top: 10, right: 10, width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center',
  },
  bottomRow: { position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', gap: 6 },
  glass: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: radius.full, backgroundColor: 'rgba(17,19,24,0.55)',
  },
  glassText: { ...typography.captionMedium, fontSize: 11.5, color: colors.white },
  content: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[2] },
  name: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.text, flex: 1 },
  rating: {
    flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.full, backgroundColor: '#FFF7E0',
  },
  ratingText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  meta: { ...typography.caption, fontSize: 13, color: colors.textSecondary },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 },
  price: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary, flexShrink: 1 },
  priceDash: { color: colors.textTertiary, fontFamily: fontFamily.medium },
  pricePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.primarySoft },
  pricePillText: { ...typography.captionMedium, fontSize: 11, color: colors.primaryDark },
});
