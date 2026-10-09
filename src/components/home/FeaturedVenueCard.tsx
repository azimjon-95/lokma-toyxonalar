import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import type { VenueListItem } from '../../types';
import { formatKm, formatNumber } from '../../lib/format';
import { useFavorites } from '../../store/favorites';

/** "Mashhur to'yxonalar" — eng yuqori reytingli to'yxona, katta rasmli karta */
export function FeaturedVenueCard({ venue, onPress }: { venue: VenueListItem; onPress: () => void }) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(venue.id);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${venue.name}, top tanlov`} style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.985 }] }]}>
      <Image source={venue.photos[0]} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
      <LinearGradient colors={['rgba(20,14,30,0)', 'rgba(20,14,30,0.25)', 'rgba(20,14,30,0.78)']} locations={[0.25, 0.55, 1]} style={StyleSheet.absoluteFill} />

      <LinearGradient colors={[colors.goldLight, colors.goldMid]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.badge}>
        <MaterialCommunityIcons name="crown" size={12} color={colors.white} />
        <Text style={styles.badgeText}>Top tanlov</Text>
      </LinearGradient>

      <Pressable
        onPress={() => toggle(venue.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={fav ? 'Saralanganlardan olib tashlash' : 'Saralanganlarga qo‘shish'}
        style={({ pressed }) => [styles.fav, pressed && { transform: [{ scale: 0.9 }] }]}
      >
        <Ionicons name={fav ? 'heart' : 'heart-outline'} size={17} color={colors.white} />
      </Pressable>

      <View style={styles.bottom}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
          <View style={styles.meta}>
            <Ionicons name="location-outline" size={13} color={colors.white} />
            <Text style={styles.metaText} numberOfLines={1}>
              {formatKm(venue.distance_km)}  ·  {formatNumber(venue.price_from)} so‘m dan
            </Text>
          </View>
        </View>
        <LinearGradient colors={[colors.goldLight, colors.goldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.go}>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </LinearGradient>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 122, marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', backgroundColor: '#3A2E3E',
    shadowColor: '#2A1630', shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  badge: { position: 'absolute', top: 11, left: 11, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, height: 22, borderRadius: 11 },
  badgeText: { fontFamily: fontFamily.semiBold, fontSize: 10.5, color: colors.white },
  fav: {
    position: 'absolute', top: 9, right: 9, width: 34, height: 34, borderRadius: 17,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(0,0,0,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  bottom: { position: 'absolute', left: 14, right: 12, bottom: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  name: { fontFamily: fontFamily.serif, fontSize: 18, lineHeight: 23, color: colors.white },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metaText: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.white, flexShrink: 1 },
  go: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
