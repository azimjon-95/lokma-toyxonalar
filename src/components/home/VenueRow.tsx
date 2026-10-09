import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import type { VenueListItem } from '../../types';
import { formatKm, formatNumber } from '../../lib/format';
import { relativeDayLabel, SESSION_LABEL } from '../../lib/dates';
import { useFavorites } from '../../store/favorites';

/** Ro'yxatdagi ixcham karta: chapda rasm, o'rtada holat/nom/masofa, o'ngda narx */
export const VenueRow = memo(function VenueRow({ venue, onPress }: { venue: VenueListItem; onPress: () => void }) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(venue.id);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={venue.name} style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.985 }] }]}>
      <View style={styles.thumbWrap}>
        <Image source={venue.photos[0]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
        <View style={styles.thumbGo}>
          <Ionicons name="arrow-forward" size={10} color={colors.white} />
        </View>
      </View>

      <View style={styles.mid}>
        {venue.next_free ? (
          <View style={styles.free}>
            <View style={styles.freeDot} />
            <Text style={styles.freeText} numberOfLines={1}>
              Bo‘sh: {relativeDayLabel(venue.next_free.date).toLowerCase()}, {SESSION_LABEL[venue.next_free.session].toLowerCase()}
            </Text>
          </View>
        ) : (
          <View style={[styles.free, styles.busy]}><Text style={styles.busyText}>Yaqin kunlarda band</Text></View>
        )}
        <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
        <View style={styles.distRow}>
          <Ionicons name="location-outline" size={12} color={colors.goldMid} />
          <Text style={styles.dist} numberOfLines={1}>{formatKm(venue.distance_km)}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Pressable onPress={() => toggle(venue.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={fav ? 'Saralanganlardan olib tashlash' : 'Saralanganlarga qo‘shish'}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={17} color={fav ? colors.primary : colors.text} />
        </Pressable>
        <View style={styles.price}>
          <Text style={styles.priceValue} numberOfLines={1}>{formatNumber(venue.price_from)} so‘m</Text>
          <Text style={styles.priceSub}>dan boshlab</Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 10, padding: 8,
    borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: '#F1EBE4',
    shadowColor: '#5A3A1A', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  thumbWrap: { width: 74, height: 62, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.creamDeep },
  thumbGo: {
    position: 'absolute', right: 5, bottom: 5, width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.goldMid, alignItems: 'center', justifyContent: 'center',
  },
  mid: { flex: 1, minWidth: 0, gap: 3 },
  free: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E9F6EE', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, maxWidth: '100%' },
  freeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  freeText: { fontFamily: fontFamily.medium, fontSize: 9.5, color: '#1F7A47', flexShrink: 1 },
  busy: { backgroundColor: '#F3F1EE' },
  busyText: { fontFamily: fontFamily.medium, fontSize: 9.5, color: colors.textSecondary },
  name: { fontFamily: fontFamily.semiBold, fontSize: 13.5, lineHeight: 17, color: colors.text },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dist: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.textSecondary },
  right: { alignSelf: 'stretch', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, paddingTop: 2 },
  price: { backgroundColor: '#FBF1E6', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5, alignItems: 'center' },
  priceValue: { fontFamily: fontFamily.semiBold, fontSize: 11.5, color: '#8A5A2B' },
  priceSub: { fontFamily: fontFamily.regular, fontSize: 8.5, color: '#A07A55', marginTop: 1 },
});
