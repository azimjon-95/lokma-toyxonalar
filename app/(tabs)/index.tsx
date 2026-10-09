import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, type LayoutChangeEvent, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { colors } from '../../src/theme';
import { HomeHero, HERO_HEIGHT, CONTENT_MAX_WIDTH } from '../../src/components/home/HomeHero';
import { TopFog } from '../../src/components/ui/TopFog';
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
import { useLokma } from '../../src/lib/lokma';
import type { VenueListItem } from '../../src/types';

const SHEET_OVERLAP = 28;
const SORT_LABEL = { distance: 'Eng yaqini birinchi', price_asc: 'Arzonidan', price_desc: 'Qimmatidan', rating: 'Eng yaxshi birinchi' } as const;

type Filter = Omit<AdvancedFilter, 'radiusKm'>;
const DEFAULT_FILTER: Filter = { quick: 'all', sort: 'rating' };

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loc = useLocation();
  const { statusTop } = useLokma();
  const listRef = useRef<FlatList<VenueListItem>>(null);
  const searchRef = useRef<TextInput>(null);
  const anchors = useRef({ search: 0, list: 0 });

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const q = useDebounced(search.trim());

  const venues = useVenues({ q, filter: filter.quick, event_type: filter.event_type, sort: filter.sort });
  // "Mashhur": shu hududdagi eng yuqori reytingli to'yxona (filtrlardan mustaqil)
  const popular = useVenues({ sort: 'rating' });
  const featured = popular.data?.[0];
  const hasFilter = filter.quick !== 'all' || !!filter.event_type || filter.sort !== DEFAULT_FILTER.sort || loc.radiusKm !== 20;
  const placeLabel = loc.place.kind === 'all' ? 'Barcha' : loc.label.split(',')[0];

  // Tepada och "tuman" (TopFog) bor — status bar belgilari to'q rangda aniq ko'rinadi
  useFocusEffect(useCallback(() => { setStatusBarStyle('dark'); }, []));

  const scrollTo = (key: 'search' | 'list') =>
    listRef.current?.scrollToOffset({ offset: Math.max(0, anchors.current[key] - insets.top - 12), animated: true });
  const anchor = (key: 'search' | 'list') => (e: LayoutChangeEvent) => {
    anchors.current[key] = e.nativeEvent.layout.y + HERO_HEIGHT + insets.top - SHEET_OVERLAP;
  };

  // To'yxona sahifasidagi qidiruv/filtr tugmalari shu yerga ?open=search|filter bilan qaytaradi
  const { open } = useLocalSearchParams<{ open?: string }>();
  useEffect(() => {
    if (open !== 'search' && open !== 'filter') return;
    if (open === 'filter') setFilterOpen(true);
    else {
      scrollTo('search');
      setTimeout(() => searchRef.current?.focus(), 400);
    }
    router.setParams({ open: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const openVenue = useCallback((slug: string) => router.push({ pathname: '/venue/[slug]', params: { slug } }), [router]);

  const resetAll = () => {
    setSearch('');
    setFilter(DEFAULT_FILTER);
  };

  const header = (
    <View>
      <HomeHero
        topInset={insets.top}
        hasFilter={hasFilter}
        onFilter={() => setFilterOpen(true)}
      />
      <View style={styles.sheet}>
        <View style={styles.inner}>
        {/* Lokma bo'limlari — varaqning eng tepasida */}
        <LokmaSwitch />

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

  const renderItem = useCallback(
    ({ item }: { item: VenueListItem }) => (
      <View style={styles.inner}>
        <VenueRow venue={item} onPress={() => openVenue(item.slug)} />
      </View>
    ),
    [openVenue],
  );
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        // Pastga tortganda sahifa joyida qotib turadi (hero ostidan oq joy chiqmaydi)
        bounces={false}
        overScrollMode="never"
      />
      {/* Status bar va Telegram tugmalari ostida doimiy yumshoq tuman (hero ham, ro'yxat ham ostidan o'tadi) */}
      <TopFog height={insets.top} statusHeight={statusTop} />

      <LocationSheet visible={placeOpen} onClose={() => setPlaceOpen(false)} />
      <FilterSheet
        visible={filterOpen}
        value={{ ...filter, radiusKm: loc.radiusKm }}
        onClose={() => setFilterOpen(false)}
        onApply={(v) => {
          setFilter({ quick: v.quick, event_type: v.event_type, sort: v.sort });
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
  inner: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' },
});
