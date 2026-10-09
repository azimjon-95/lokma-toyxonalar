import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { colors } from '../../src/theme';
import { HomeHero, HERO_HEIGHT } from '../../src/components/home/HomeHero';
import { CategoryRow, type CategoryKey } from '../../src/components/home/CategoryRow';
import { HomeSearchBar } from '../../src/components/home/HomeSearchBar';
import { SectionHeader } from '../../src/components/home/SectionHeader';
import { FeaturedVenueCard } from '../../src/components/home/FeaturedVenueCard';
import { VenueRow } from '../../src/components/home/VenueRow';
import { LokmaSwitch } from '../../src/components/home/LokmaSwitch';
import { FilterSheet, type AdvancedFilter } from '../../src/components/home/FilterSheet';
import { LocationSheet } from '../../src/components/home/LocationSheet';
import { Button } from '../../src/components/ui/Button';
import { EmptyState, ErrorState, Loading } from '../../src/components/ui/ScreenState';
import { useVenues } from '../../src/hooks/queries';
import { useDebounced } from '../../src/hooks/useDebounced';
import { useLocation } from '../../src/store/location';
import type { EventTypeCode, VenueListItem } from '../../src/types';

const SHEET_OVERLAP = 28;
const SORT_LABEL = { distance: 'Eng yaqini birinchi', price_asc: 'Arzonidan', price_desc: 'Qimmatidan', rating: 'Eng yaxshi birinchi' } as const;
/** Kategoriya → tadbir turi (server filtri) */
const CATEGORY_EVENT: Partial<Record<CategoryKey, EventTypeCode>> = { banquet: 'kechki', ceremony: 'nikoh' };

type Filter = Omit<AdvancedFilter, 'radiusKm'>;
const DEFAULT_FILTER: Filter = { quick: 'all', sort: 'rating' };

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loc = useLocation();
  const listRef = useRef<FlatList<VenueListItem>>(null);
  const searchRef = useRef<TextInput>(null);
  const anchors = useRef({ search: 0, list: 0 });

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const q = useDebounced(search.trim());

  const venues = useVenues({ q, filter: filter.quick, event_type: filter.event_type, sort: filter.sort });
  // "Mashhur": shu hududdagi eng yuqori reytingli to'yxona (filtrlardan mustaqil)
  const popular = useVenues({ sort: 'rating' });
  const featured = popular.data?.[0];
  const hasFilter = filter.quick !== 'all' || !!filter.event_type || filter.sort !== DEFAULT_FILTER.sort || loc.radiusKm !== 20;
  const placeLabel = loc.place.kind === 'all' ? 'Barcha' : loc.label.split(',')[0];

  // Hero ustida status bar oq, oq qismga o'tganda qora
  useFocusEffect(useCallback(() => {
    setStatusBarStyle(pastHero ? 'dark' : 'light');
    return () => setStatusBarStyle('dark');
  }, [pastHero]));

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const past = e.nativeEvent.contentOffset.y > HERO_HEIGHT - SHEET_OVERLAP;
    setPastHero((p) => (p === past ? p : past));
  }, []);

  const scrollTo = (key: 'search' | 'list') =>
    listRef.current?.scrollToOffset({ offset: Math.max(0, anchors.current[key] - insets.top - 12), animated: true });
  const anchor = (key: 'search' | 'list') => (e: LayoutChangeEvent) => {
    anchors.current[key] = e.nativeEvent.layout.y + HERO_HEIGHT + insets.top - SHEET_OVERLAP;
  };

  const openVenue = useCallback((slug: string) => router.push({ pathname: '/venue/[slug]', params: { slug } }), [router]);

  const onCategory = (k: CategoryKey) => {
    if (k === 'favorites') { router.push('/favorites'); return; }
    // Qayta bosilsa — filtr o'chadi ("To'yxonalar" — hammasi)
    const next: CategoryKey | null = k === 'all' ? 'all' : category === k ? null : k;
    setCategory(next);
    setFilter((f) => ({ ...f, event_type: next ? CATEGORY_EVENT[next] : undefined }));
    scrollTo('list');
  };

  const resetAll = () => {
    setSearch('');
    setCategory(null);
    setFilter(DEFAULT_FILTER);
  };

  const header = (
    <View>
      <HomeHero
        topInset={insets.top}
        hasFilter={hasFilter}
        onSearch={() => { scrollTo('search'); setTimeout(() => searchRef.current?.focus(), 350); }}
        onFilter={() => setFilterOpen(true)}
        onExplore={() => scrollTo('list')}
      />
      <View style={styles.sheet}>
        <CategoryRow active={category} onPress={onCategory} />

        <View style={styles.gapM} onLayout={anchor('search')}>
          <HomeSearchBar ref={searchRef} value={search} onChange={setSearch} placeLabel={placeLabel} onPlacePress={() => setPlaceOpen(true)} />
        </View>

        {!!featured && !q && (
          <>
            <View style={styles.gapL}>
              <SectionHeader
                title="Mashhur to‘yxonalar"
                serif
                action="Barchasi"
                actionLink
                actionIcon="arrow-forward"
                onAction={() => { setFilter((f) => ({ ...f, sort: 'rating' })); scrollTo('list'); }}
              />
            </View>
            <View style={styles.gapS}>
              <FeaturedVenueCard venue={featured} onPress={() => openVenue(featured.slug)} />
            </View>
          </>
        )}

        <View style={styles.gapS}>
          <LokmaSwitch />
        </View>

        <View style={[styles.gapL, { marginBottom: 12 }]} onLayout={anchor('list')}>
          <SectionHeader
            title={venues.data ? `${venues.data.length} ta to‘yxona` : 'To‘yxonalar'}
            action={SORT_LABEL[filter.sort]}
            actionIcon="options-outline"
            onAction={() => setFilterOpen(true)}
          />
        </View>
      </View>
    </View>
  );

  const empty = venues.isLoading ? (
    <Loading />
  ) : venues.isError ? (
    <ErrorState message={(venues.error as Error).message} onRetry={() => venues.refetch()} />
  ) : (
    <EmptyState
      title="Bu filtr bo‘yicha to‘yxona topilmadi"
      subtitle={loc.place.kind === 'all' ? undefined : `${loc.radiusKm} km radiusda`}
      action={
        <Button
          title={loc.radiusKm < 50 && loc.place.kind !== 'all' ? 'Radiusni 50 km qilish' : 'Filtrni tozalash'}
          variant="outline"
          size="sm"
          onPress={() => (loc.radiusKm < 50 && loc.place.kind !== 'all' ? loc.setRadiusKm(50) : resetAll())}
        />
      }
    />
  );

  const renderItem = useCallback(({ item }: { item: VenueListItem }) => <VenueRow venue={item} onPress={() => openVenue(item.slug)} />, [openVenue]);
  const data = useMemo(() => venues.data ?? [], [venues.data]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(v) => v.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={{ paddingBottom: 24 }}
        onScroll={onScroll}
        scrollEventThrottle={32}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={venues.isRefetching}
            onRefresh={() => { venues.refetch(); popular.refetch(); loc.refresh(); }}
            tintColor={colors.white}
            progressViewOffset={insets.top}
          />
        }
      />
      {/* Hero'dan o'tgach status bar ostida oq qoplama (matn soat ostida ko'rinmasin) */}
      {pastHero && insets.top > 0 && <View style={[styles.statusCover, { height: insets.top }]} pointerEvents="none" />}

      <LocationSheet visible={placeOpen} onClose={() => setPlaceOpen(false)} />
      <FilterSheet
        visible={filterOpen}
        value={{ ...filter, radiusKm: loc.radiusKm }}
        onClose={() => setFilterOpen(false)}
        onApply={(v) => {
          setFilter({ quick: v.quick, event_type: v.event_type, sort: v.sort });
          setCategory(v.event_type === 'kechki' ? 'banquet' : v.event_type === 'nikoh' ? 'ceremony' : null);
          loc.setRadiusKm(v.radiusKm);
          setFilterOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  sheet: {
    marginTop: -SHEET_OVERLAP, paddingTop: 12, backgroundColor: colors.white,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
  },
  gapS: { marginTop: 12 },
  gapM: { marginTop: 14 },
  gapL: { marginTop: 22 },
  statusCover: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: colors.white },
});
