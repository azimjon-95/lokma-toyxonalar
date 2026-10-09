import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fontFamily } from '../../src/theme';
import { useCalendar, useQuote, useVenue } from '../../src/hooks/queries';
import { useFavorites } from '../../src/store/favorites';
import { useLokma } from '../../src/lib/lokma';
import { VenueHero, WAVE_HEIGHT } from '../../src/components/venue/VenueHero';
import { VenueHeader } from '../../src/components/venue/VenueHeader';
import { PhotoStrip } from '../../src/components/venue/PhotoStrip';
import { VenueStats } from '../../src/components/venue/VenueStats';
import { MonthCalendar } from '../../src/components/venue/MonthCalendar';
import { useChromeTone } from '../../src/hooks/useChromeTone';
import { DaySlots } from '../../src/components/venue/DaySlots';
import { BookingBar } from '../../src/components/venue/BookingBar';
import { SectionTitle } from '../../src/components/venue/SectionTitle';
import { Leaf, FloralLine } from '../../src/components/venue/Decor';
import { MenuPicker } from '../../src/components/venue/MenuPicker';
import { VendorSlider } from '../../src/components/venue/VendorSlider';
import { QuoteSummary } from '../../src/components/venue/QuoteSummary';
import { BookingSheet } from '../../src/components/venue/BookingSheet';
import { Button } from '../../src/components/ui/Button';
import { TopFog } from '../../src/components/ui/TopFog';
import { ErrorState, Loading } from '../../src/components/ui/ScreenState';
import { formatSum } from '../../src/lib/format';
import {
  SESSION_LABEL, addDays, formatDayLong, isWeekend, parseISODate, startOfToday, toISODate, toMonthKey,
} from '../../src/lib/dates';
import { pricePerGuest } from '../../src/services/pricing';
import type { CalendarDay, EventTypeCode, QuoteRequest, SessionCode } from '../../src/types';

/** Bo'sh seans tanlashda ustuvorlik (to'ylar asosan kechqurun) */
const PREFERRED: SessionCode[] = ['evening', 'day', 'morning'];
const HERO_BASE = 156;
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

export default function VenueScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { embedded } = useLokma();
  const { isFavorite, toggle } = useFavorites();
  const venueQ = useVenue(slug);
  const venue = venueQ.data;

  const [hallIdx, setHallIdx] = useState(0);
  const [month, setMonth] = useState(() => firstOfMonth(startOfToday()));
  const [date, setDate] = useState<string | null>(null);
  const [session, setSession] = useState<SessionCode | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [guests, setGuests] = useState(300);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [carId, setCarId] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);

  const hall = venue?.halls[hallIdx];
  const today = toISODate(startOfToday());

  const cal = useCalendar(hall?.id, toMonthKey(month));
  const days = useMemo(() => new Map<string, CalendarDay>((cal.data ?? []).map((d) => [d.date, d])), [cal.data]);
  const calLoading = cal.isFetching;

  useEffect(() => {
    if (!venue) return;
    setMenuId((m) => m ?? venue.menu_packages[1]?.id ?? venue.menu_packages[0]?.id ?? null);
  }, [venue]);

  // Kun tanlanmagan yoki band bo'lsa — oynadagi birinchi bo'sh kun va tavsiya etilgan seans
  useEffect(() => {
    if (!days.size) return;
    const cur = date ? days.get(date) : undefined;
    if (cur && date! >= today) {
      if (!session || cur.sessions[session] !== 'free') setSession(PREFERRED.find((s) => cur.sessions[s] === 'free') ?? null);
      return;
    }
    if (date && !cur) return; // tanlangan kun boshqa oynada — o'zgartirmaymiz
    const first = [...days.values()].sort((a, b) => a.date.localeCompare(b.date))
      .find((d) => d.date >= today && PREFERRED.some((s) => d.sessions[s] === 'free'));
    if (first) {
      setDate(first.date);
      setSession(PREFERRED.find((s) => first.sessions[s] === 'free') ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const menu = venue?.menu_packages.find((m) => m.id === menuId);
  const weekend = date ? isWeekend(parseISODate(date)) : false;
  const sessionTpl = venue?.sessions.find((s) => s.code === session);
  const selectedDay = date ? days.get(date) : undefined;
  const sessionFree = !!session && selectedDay?.sessions[session] === 'free';
  const recommended = selectedDay ? PREFERRED.find((s) => selectedDay.sessions[s] === 'free') ?? null : null;

  const quoteReq: QuoteRequest | null =
    venue && hall && date && session && sessionFree && menu
      ? { venue_id: venue.id, hall_id: hall.id, date, session, guests, menu_package_id: menu.id, vendor_ids: [videoId, carId].filter(Boolean) as string[] }
      : null;
  const quote = useQuote(quoteReq);

  // Mehmon chegarasi: minimum seansga, maksimum tanlangan zalga bog'liq — server bilan bir xil
  const guestsMin = sessionTpl?.min_guests ?? venue?.guests_min ?? 150;
  const guestsMax = hall?.capacity_max ?? venue?.guests_max ?? 1000;
  useEffect(() => {
    setGuests((g) => Math.min(Math.max(g, guestsMin), guestsMax));
  }, [guestsMin, guestsMax]);

  const eventType: EventTypeCode = sessionTpl?.event_types[0] ?? 'kechki';
  const timeLabel = sessionTpl ? `${sessionTpl.start_time}–${sessionTpl.end_time}` : '';
  const subtitle = date && session ? `${formatDayLong(date)} · ${SESSION_LABEL[session]} ${timeLabel}` : '';
  const ppg = menu && sessionTpl ? pricePerGuest(menu, sessionTpl, weekend, venue!.weekend_factor) : null;

  const videos = useMemo(() => venue?.vendors.filter((v) => v.type === 'video') ?? [], [venue]);
  const cars = useMemo(() => venue?.vendors.filter((v) => v.type === 'cortege') ?? [], [venue]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const selectDate = (iso: string) => {
    setDate(iso);
    // Boshqa oydagi kun (masalan ‹ › bilan oy chegarasidan o'tilganda) — kalendar shu oyga o'tadi
    if (!iso.startsWith(toMonthKey(month))) setMonth(firstOfMonth(parseISODate(iso)));
  };
  const shiftDay = (delta: number) => {
    if (!date) return;
    const next = toISODate(addDays(parseISODate(date), delta));
    if (next >= today) selectDate(next);
  };

  const heroHeight = insets.top + HERO_BASE;

  // Tepadagi fon: rasm ustida — to'q, sahifa foniga aylantirilganda — och (tuman va status bar moslashadi)
  const [onPage, setOnPage] = useState(false);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const reached = e.nativeEvent.contentOffset.y > heroHeight - WAVE_HEIGHT - insets.top;
    setOnPage((p) => (p === reached ? p : reached));
  }, [heroHeight, insets.top]);
  const tone = onPage ? 'light' : 'dark';
  useChromeTone(tone);

  if (venueQ.isLoading) return <View style={[styles.fill, { paddingTop: insets.top }]}><Loading /></View>;
  if (venueQ.isError || !venue) {
    return (
      <View style={[styles.fill, { paddingTop: insets.top }]}>
        <ErrorState message={(venueQ.error as Error | null)?.message} onRetry={() => venueQ.refetch()} />
        <Button title="Orqaga" variant="ghost" onPress={goBack} />
      </View>
    );
  }

  const share = () => Share.share({ message: `${venue.name} — https://lokma.uz/toyxonalar/venue/${venue.slug}` });

  return (
    <View style={styles.fill}>
      {/* Pastki chap burchakdagi bezak (panel ortida) */}
      <FloralLine size={120} style={styles.floral} />
      <Leaf size={64} rotate={-18} style={styles.leafBottom} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        <VenueHero
          photo={venue.photos[0]}
          topInset={insets.top}
          height={heroHeight}
          showBack={!embedded}
          onBack={goBack}
          onSearch={() => router.navigate({ pathname: '/', params: { open: 'search' } })}
          onFilter={() => router.navigate({ pathname: '/', params: { open: 'filter' } })}
        />

        <View style={styles.body}>
          <Leaf size={58} rotate={8} style={styles.leafRight} />

          <VenueHeader
            name={venue.name}
            address={venue.address}
            distanceKm={venue.distance_km}
            priceFrom={venue.price_from}
            rating={venue.rating}
            reviews={venue.reviews_count}
          />

          <View style={styles.gap}>
            <PhotoStrip photos={venue.photos} onShare={share} isFavorite={isFavorite(venue.id)} onFavorite={() => toggle(venue.id)} />
          </View>

          <View style={styles.gap}>
            <VenueStats
              items={[
                { icon: 'account-group-outline', value: `${venue.capacity_min}–${venue.capacity_max}`, label: 'mehmon' },
                { icon: 'silverware-fork-knife', value: `${venue.halls.length} zal`, label: venue.halls.length > 1 ? 'katta va kichik' : venue.halls[0]?.name.toLowerCase() ?? '' },
                { icon: 'parking', value: venue.parking_spots ? String(venue.parking_spots) : '—', label: 'parking' },
                { icon: 'room-service-outline', value: 'To‘liq xizmat', label: 'taqdim etiladi' },
              ]}
            />
          </View>

          {venue.halls.length > 1 && (
            <View style={[styles.gap, styles.hallRow]}>
              {venue.halls.map((h, i) => {
                const on = i === hallIdx;
                return (
                  <Pressable key={h.id} onPress={() => { setHallIdx(i); setDate(null); }} style={[styles.hallBtn, on && styles.hallBtnOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                    <Text style={[styles.hallName, on && { color: colors.white }]}>{h.name}</Text>
                    <Text style={[styles.hallCap, on && { color: 'rgba(255,255,255,0.8)' }]}>{h.capacity_min}–{h.capacity_max} mehmon</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.gapL}>
            <MonthCalendar
              month={month}
              days={days}
              loading={calLoading}
              selected={date}
              onSelect={selectDate}
              onShift={(delta) => { setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1)); setDate(null); }}
              onPickMonth={(m) => { setMonth(firstOfMonth(m)); setDate(null); }}
            />
          </View>

          {date && menu && (
            <View style={styles.gapL}>
              <DaySlots
                date={date}
                day={selectedDay}
                sessions={venue.sessions}
                selected={session}
                recommended={recommended}
                onSelect={setSession}
                priceFor={(s) => pricePerGuest(menu, s, weekend, venue.weekend_factor)}
                onPrevDay={() => shiftDay(-1)}
                onNextDay={() => shiftDay(1)}
                canPrevDay={date > today}
              />
            </View>
          )}

          {menu && (
            <View style={[styles.gapL, styles.pad]}>
              <MenuPicker
                packages={venue.menu_packages}
                selectedId={menu.id}
                onSelect={setMenuId}
                guests={guests}
                onGuests={setGuests}
                min={guestsMin}
                max={guestsMax}
                perGuest={ppg ?? undefined}
                perGuestNote={`1 kishi uchun · ${sessionTpl ? SESSION_LABEL[sessionTpl.code].toLowerCase() : 'seans tanlang'}${weekend ? ', dam olish kuni' : ''}`}
              />
            </View>
          )}

          <View style={styles.gapL}>
            <SectionTitle icon="star-four-points-outline" title="Qulayliklar" />
            <View style={[styles.amen, styles.pad]}>
              {venue.amenities.map((a) => (
                <View key={a} style={styles.amenItem}>
                  <Ionicons name="checkmark-circle" size={17} color={colors.primary} />
                  <Text style={styles.amenText} numberOfLines={1}>{a}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.gapL, styles.pad]}>
            <VendorSlider title="Videochilar" icon="videocam-outline" vendors={videos} selectedId={videoId} onToggle={(id) => setVideoId((c) => (c === id ? null : id))} />
          </View>
          <View style={[styles.gapL, styles.pad]}>
            <VendorSlider title="Kortej" icon="car-sport-outline" vendors={cars} selectedId={carId} onToggle={(id) => setCarId((c) => (c === id ? null : id))} />
          </View>

          <View style={[styles.gapL, styles.pad]}>
            {quoteReq && quote.isError ? (
              <Text style={styles.quoteErr}>{(quote.error as Error).message}</Text>
            ) : (
              <QuoteSummary quote={quoteReq ? quote.data : undefined} guests={guests} menuName={menu?.name ?? ''} depositPercent={venue.deposit_percent} />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Hero status bar ortiga chiqadi — tizim belgilari va Telegram tugmalari tuman ostida o'qiladi */}
      <TopFog height={insets.top} tone={tone} />

      <BookingBar
        label={sessionFree && date ? `${formatDayLong(date).split(',')[0]} · ${timeLabel}` : 'Bo‘sh kun va vaqtni tanlang'}
        price={sessionFree && ppg ? formatSum(ppg) : '—'}
        disabled={!quoteReq || !quote.data || quote.isError}
        onPress={() => setSheet(true)}
        bottomInset={insets.bottom}
      />

      <BookingSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        request={quoteReq ? { ...quoteReq, event_type: eventType } : null}
        summary={{ title: `${venue.name} · ${hall?.name ?? ''}`, subtitle: `${subtitle} · ${guests} mehmon`, total: quote.data?.total ?? 0, deposit: quote.data?.deposit ?? 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  body: { marginTop: -WAVE_HEIGHT * 0.35, paddingTop: 4, backgroundColor: colors.page, width: '100%', maxWidth: 720, alignSelf: 'center' },
  pad: { paddingHorizontal: 16 },
  gap: { marginTop: 16 },
  gapL: { marginTop: 26 },
  hallRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  hallBtn: { flex: 1, borderRadius: 18, borderWidth: 1, borderColor: '#EDE3D8', backgroundColor: colors.white, paddingVertical: 10, paddingHorizontal: 14 },
  hallBtnOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  hallName: { fontFamily: fontFamily.semiBold, fontSize: 14.5, color: colors.text },
  hallCap: { fontFamily: fontFamily.regular, fontSize: 12, color: '#7A7068', marginTop: 1 },
  amen: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  amenItem: {
    width: '48.6%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 13, borderWidth: 1, borderColor: '#F0E6DB',
  },
  amenText: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.text, flex: 1 },
  quoteErr: { fontFamily: fontFamily.regular, fontSize: 14, color: colors.error, backgroundColor: colors.errorBg, borderRadius: 14, padding: 14 },
  leafRight: { position: 'absolute', right: -14, top: -26, zIndex: 3 },
  leafBottom: { position: 'absolute', left: -16, bottom: 18, zIndex: 0, opacity: 0.9 },
  floral: { position: 'absolute', left: -8, bottom: 70, zIndex: 0 },
});
