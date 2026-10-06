import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, layout, typography } from '../../src/theme';
import { VenueCard } from '../../src/components/home/VenueCard';
import { Chip } from '../../src/components/ui/Chip';
import { mockVenues } from '../../src/data/mockVenues';

const { width } = Dimensions.get('window');

const FILTERS = ['Hammasi', "Bugun bo'sh", '150 ming gacha', '500+ mehmon', 'Parking'];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('Hammasi');
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <Text style={styles.locationText}>Chilonzor, Toshkent</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </View>
        <TouchableOpacity style={styles.favBtn}>
          <Ionicons name="heart-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search + Map */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="To'yxona qidirish"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => router.push('/(tabs)/map')}
        >
          <Ionicons name="map" size={18} color={colors.white} />
          <Text style={styles.mapBtnText}>Xarita</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Banner carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>3 kun ichida bo'sh</Text>
          <Text style={styles.sectionSub}>6–8 oktabr · 20 km atrofingizda</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
          decelerationRate="fast"
          snapToInterval={width * 0.78 + 12}
        >
          {mockVenues.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={styles.bannerCard}
              activeOpacity={0.9}
              onPress={() => router.push(`/venue/${v.slug}`)}
            >
              <View style={styles.bannerImagePlaceholder}>
                <Ionicons name="business-outline" size={40} color={colors.primary} />
              </View>
              <View style={styles.bannerBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.bannerBadgeText}>Bugun · Kechki 18:00</Text>
              </View>
              <View style={styles.bannerInfo}>
                <Text style={styles.bannerName}>{v.name}</Text>
                <Text style={styles.bannerMeta}>
                  {v.distance_km} km · {v.price_from?.toLocaleString()} so'm dan
                </Text>
              </View>
              <View style={styles.bannerArrow}>
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((f) => (
            <Chip
              key={f}
              label={f}
              selected={selectedFilter === f}
              onPress={() => setSelectedFilter(f)}
              style={{ marginRight: 8 }}
            />
          ))}
        </ScrollView>

        {/* List header */}
        <View style={styles.listHeader}>
          <Text style={styles.listCount}>{mockVenues.length} ta to'yxona</Text>
          <Text style={styles.listSort}>Eng yaqini birinchi</Text>
        </View>

        {/* Venue cards */}
        {mockVenues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            onPress={() => router.push(`/venue/${venue.slug}`)}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  locationText: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  favBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    gap: 8,
    marginBottom: spacing[3],
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[3],
    height: 46,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mapButton,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    gap: 6,
  },
  mapBtnText: {
    ...typography.captionMedium,
    color: colors.white,
  },
  scroll: {
    paddingHorizontal: layout.screenPadding,
  },
  sectionHeader: {
    marginBottom: spacing[3],
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  carousel: {
    paddingBottom: spacing[4],
    gap: 12,
  },
  bannerCard: {
    width: width * 0.78,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginRight: 12,
  },
  bannerImagePlaceholder: {
    height: 140,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    gap: 5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  bannerBadgeText: {
    ...typography.captionMedium,
    fontSize: 12,
  },
  bannerInfo: {
    padding: spacing[3],
  },
  bannerName: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  bannerMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bannerArrow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    paddingVertical: spacing[2],
    marginBottom: spacing[3],
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  listCount: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  listSort: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
