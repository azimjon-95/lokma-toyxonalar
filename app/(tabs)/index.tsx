import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, layout, radius, spacing, typography, fontFamily } from '../../src/theme';
import { VenueCard } from '../../src/components/home/VenueCard';
import { FreeSoonCarousel } from '../../src/components/home/FreeSoonCarousel';
import { FilterSheet, type AdvancedFilter } from '../../src/components/home/FilterSheet';
import { Chip } from '../../src/components/ui/Chip';
import { Button } from '../../src/components/ui/Button';
import { IconButton } from '../../src/components/ui/IconButton';
import { EmptyState, ErrorState, Loading } from '../../src/components/ui/ScreenState';
import { useFreeSoon, useVenues } from '../../src/hooks/queries';
import { useDebounced } from '../../src/hooks/useDebounced';
import { useLocation } from '../../src/store/location';
import { LocationSheet } from '../../src/components/home/LocationSheet';
import { LokmaSwitch } from '../../src/components/home/LokmaSwitch';
import { addDays, rangeLabel, startOfToday } from '../../src/lib/dates';
import type { QuickFilter, VenueListItem } from '../../src/types';

const CHIPS: { key: QuickFilter; label: string }[] = [
  { key: 'all', label: 'Hammasi' },
  { key: 'free_today', label: 'Bugun bo‘sh' },
  { key: 'cheap', label: '150 ming gacha' },
  { key: 'big', label: '500+ mehmon' },
  { key: 'parking', label: 'Parking' },
];

const SORT_LABEL = { distance: 'Eng yaqini birinchi', price_asc: 'Arzonidan', price_desc: 'Qimmatidan', rating: 'Reyting bo‘yicha' } as const;

export default function HomeScreen() {
  const router = useRouter();
  const loc = useLocation();
  const [search, setSearch] = useState('');
  const [chip, setChip] = useState<QuickFilter>('all');
  const [adv, setAdv] = useState<Omit<AdvancedFilter, 'radiusKm'>>({ sort: 'distance' });
  const [filterOpen, setFilterOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  // Hudud matni: butun O'zbekiston tanlansa km ko'rsatilmaydi
  const areaText = loc.place.kind === 'all' ? 'butun O‘zbekiston bo‘yicha' : `${loc.radiusKm} km atrofingizda`;
  const q = useDebounced(search.trim());

  const venues = useVenues({ q, filter: chip, event_type: adv.event_type, sort: adv.sort });
  const freeSoon = useFreeSoon(3);
  const today = startOfToday();
  const hasAdvanced = !!adv.event_type || adv.sort !== 'distance' || loc.radiusKm !== 20;

  const openVenue = useCallback((slug: string) => router.push({ pathname: '/venue/[slug]', params: { slug } }), [router]);
  const renderItem = useCallback(
    ({ item }: { item: VenueListItem }) => (
      <View style={{ paddingHorizontal: layout.screenPadding }}>
        <VenueCard venue={item} onPress={() => openVenue(item.slug)} />
      </View>
    ),
    [openVenue],
  );

  const header = useMemo(
    () => (
      <View>
        {(freeSoon.data?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.h1}>3 kun ichida bo‘sh</Text>
              <Text style={styles.sub}>
                {rangeLabel(today, addDays(today, 2))} · {areaText}
              </Text>
            </View>
            <FreeSoonCarousel items={freeSoon.data!} onPress={openVenue} />
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CHIPS.map((c) => (
            <Chip key={c.key} label={c.label} selected={chip === c.key} onPress={() => setChip(c.key)} />
          ))}
        </ScrollView>
        <View style={styles.listHead}>
          <Text style={styles.h2}>{venues.data ? `${venues.data.length} ta to‘yxona` : 'To‘yxonalar'}</Text>
          <Text style={styles.sub}>{SORT_LABEL[adv.sort]}</Text>
        </View>
      </View>
    ),
    [freeSoon.data, chip, venues.data, adv.sort, areaText, openVenue, today],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        {/* Bosilsa — hudud tanlash: Lokma manzillari, GPS, boshqa hudud, butun O'zbekiston */}
        <Pressable onPress={() => setPlaceOpen(true)} accessibilityRole="button" accessibilityLabel="Hududni tanlash" style={{ flex: 1 }}>
          <View style={styles.locLabelRow}>
            <View style={[styles.locDot, { backgroundColor: loc.status === 'ready' ? colors.success : loc.status === 'locating' ? '#F0A35E' : colors.textTertiary }]} />
            <Text style={styles.locLabel}>
              {loc.place.kind === 'address' ? 'Mening manzilim'
                : loc.place.kind === 'region' ? 'Tanlangan hudud'
                  : loc.place.kind === 'all' ? 'Barcha to‘yxonalar'
                    : loc.status === 'locating' ? 'Joylashuv aniqlanmoqda…' : loc.status === 'ready' ? 'Joylashuv · avtomatik' : 'Joylashuv aniqlanmadi · bosing'}
            </Text>
          </View>
          <View style={styles.locRow}>
            <Text style={styles.locText} numberOfLines={1}>{loc.label}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </View>
        </Pressable>
        <IconButton icon="heart-outline" label="Saralanganlar" variant="outline" onPress={() => router.push('/favorites')} />
      </View>

      {/* Lokma Go / Lokma Market'ga qaytish */}
      <LokmaSwitch />

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={19} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="To‘yxona qidirish"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            accessibilityLabel="To‘yxona qidirish"
          />
          {!!search && (
            <Pressable onPress={() => setSearch('')} hitSlop={8} accessibilityLabel="Tozalash">
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
        <Pressable onPress={() => setFilterOpen(true)} style={styles.filterBtn} accessibilityRole="button" accessibilityLabel="Filtr">
          <Ionicons name="options-outline" size={20} color={colors.text} />
          {hasAdvanced && <View style={styles.filterDot} />}
        </Pressable>
        <Pressable onPress={() => router.push('/map')} style={styles.mapBtn} accessibilityRole="button">
          <Ionicons name="map-outline" size={18} color={colors.white} />
          <Text style={styles.mapBtnText}>Xarita</Text>
        </Pressable>
      </View>

      {venues.isLoading ? (
        <Loading />
      ) : venues.isError ? (
        <ErrorState message={(venues.error as Error).message} onRetry={() => venues.refetch()} />
      ) : (
        <FlatList
          data={venues.data}
          keyExtractor={(v) => v.id}
          renderItem={renderItem}
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingBottom: spacing[8] }}
          ListEmptyComponent={
            <EmptyState
              title="Bu filtr bo‘yicha to‘yxona topilmadi"
              subtitle={`${loc.radiusKm} km radiusda`}
              action={
                <Button
                  title={loc.radiusKm < 50 ? 'Radiusni 50 km qilish' : 'Filtrni tozalash'}
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    if (loc.radiusKm < 50) loc.setRadiusKm(50);
                    else { setChip('all'); setSearch(''); setAdv({ sort: 'distance' }); }
                  }}
                />
              }
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={venues.isRefetching}
              onRefresh={() => { venues.refetch(); freeSoon.refetch(); }}
              tintColor={colors.primary}
            />
          }
          style={styles.list}
        />
      )}

      <LocationSheet visible={placeOpen} onClose={() => setPlaceOpen(false)} />

      <FilterSheet
        visible={filterOpen}
        value={{ ...adv, radiusKm: loc.radiusKm }}
        onClose={() => setFilterOpen(false)}
        onApply={(v) => {
          setAdv({ event_type: v.event_type, sort: v.sort });
          loc.setRadiusKm(v.radiusKm);
          setFilterOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: layout.screenPadding, paddingTop: spacing[2], paddingBottom: spacing[3] },
  locLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locDot: { width: 8, height: 8, borderRadius: 4 },
  locLabel: { ...typography.caption, fontSize: 12, color: colors.textSecondary },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  locText: { ...typography.h4, fontFamily: fontFamily.bold, fontSize: 17, color: colors.text, flexShrink: 1 },
  searchRow: { flexDirection: 'row', gap: spacing[2], paddingHorizontal: layout.screenPadding, paddingBottom: spacing[3] },
  searchBox: { flex: 1, height: 48, borderRadius: 14, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  searchInput: { flex: 1, ...typography.body, color: colors.text, paddingVertical: 0 },
  filterBtn: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  filterDot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  mapBtn: { height: 48, borderRadius: 14, backgroundColor: colors.mapButton, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14 },
  mapBtnText: { ...typography.bodySemiBold, fontSize: 14, color: colors.white },
  list: { flex: 1 },
  section: { paddingTop: spacing[2] },
  sectionHead: { paddingHorizontal: layout.screenPadding, marginBottom: spacing[3] },
  h1: { ...typography.h2, fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.text },
  h2: { ...typography.h3, fontFamily: fontFamily.extraBold, color: colors.text },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  chips: { gap: spacing[2], paddingHorizontal: layout.screenPadding, paddingTop: spacing[5], paddingBottom: spacing[2] },
  listHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: layout.screenPadding, paddingTop: spacing[3], paddingBottom: spacing[4] },
});
