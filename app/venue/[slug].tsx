import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, layout, spacing, typography, fontFamily } from '../../src/theme';
import { useCalendar, useQuote, useVenue } from '../../src/hooks/queries';
import { useFavorites } from '../../src/store/favorites';
import { Gallery } from '../../src/components/venue/Gallery';
import { AvailabilityCalendar } from '../../src/components/venue/AvailabilityCalendar';
import { SessionList } from '../../src/components/venue/SessionList';
import { MenuPicker } from '../../src/components/venue/MenuPicker';
import { VendorSlider } from '../../src/components/venue/VendorSlider';
import { QuoteSummary } from '../../src/components/venue/QuoteSummary';
import { BookingSheet } from '../../src/components/venue/BookingSheet';
import { Button } from '../../src/components/ui/Button';
import { ErrorState, Loading } from '../../src/components/ui/ScreenState';
import { formatKm, formatSum } from '../../src/lib/format';
import { SESSION_LABEL, isWeekend, parseISODate, startOfToday, toISODate, toMonthKey, formatDayLong } from '../../src/lib/dates';
import { pricePerGuest } from '../../src/services/pricing';
import type { EventTypeCode, QuoteRequest, SessionCode } from '../../src/types';

const PREFERRED: SessionCode[] = ['evening', 'day', 'morning'];

export default function VenueScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggle } = useFavorites();
  const venueQ = useVenue(slug);
  const venue = venueQ.data;

  const [hallIdx, setHallIdx] = useState(0);
  const [month, setMonth] = useState(() => {
    const t = startOfToday();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [date, setDate] = useState<string | null>(null);
  const [session, setSession] = useState<SessionCode | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [guests, setGuests] = useState(300);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [carId, setCarId] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);

  const hall = venue?.halls[hallIdx];
  const cal = useCalendar(hall?.id, toMonthKey(month));
  const today = toISODate(startOfToday());

  // Boshlang'ich qiymatlar server ma'lumoti kelganda
  useEffect(() => {
    if (!venue) return;
    setMenuId((m) => m ?? venue.menu_packages[1]?.id ?? venue.menu_packages[0]?.id ?? null);
    setGuests((g) => Math.min(Math.max(g, venue.guests_min), venue.guests_max));
  }, [venue]);

  // Tanlangan kun yo'q bo'lsa — oydagi birinchi bo'sh kun va seansni avtomatik tanlash
  useEffect(() => {
    if (!cal.data) return;
    const inMonth = date && date.startsWith(toMonthKey(month));
    const day = inMonth ? cal.data.find((d) => d.date === date) : undefined;
    if (day) {
      if (!session || day.sessions[session] !== 'free') setSession(PREFERRED.find((s) => day.sessions[s] === 'free') ?? null);
      return;
    }
    const first = cal.data.find((d) => d.date >= today && PREFERRED.some((s) => d.sessions[s] === 'free'));
    if (first) {
      setDate(first.date);
      setSession(PREFERRED.find((s) => first.sessions[s] === 'free') ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cal.data]);

  const menu = venue?.menu_packages.find((m) => m.id === menuId);
  const weekend = date ? isWeekend(parseISODate(date)) : false;
  const sessionTpl = venue?.sessions.find((s) => s.code === session);
  const selectedDay = cal.data?.find((d) => d.date === date);
  const sessionFree = !!session && selectedDay?.sessions[session] === 'free';

  const quoteReq: QuoteRequest | null =
    venue && hall && date && session && sessionFree && menu
      ? { venue_id: venue.id, hall_id: hall.id, date, session, guests, menu_package_id: menu.id, vendor_ids: [videoId, carId].filter(Boolean) as string[] }
      : null;
  const quote = useQuote(quoteReq);

  const eventType: EventTypeCode = sessionTpl?.event_types[0] ?? 'kechki';
  const subtitle = date && session ? `${formatDayLong(date)} · ${SESSION_LABEL[session]} ${sessionTpl?.start_time}–${sessionTpl?.end_time}` : '';

  const videos = useMemo(() => venue?.vendors.filter((v) => v.type === 'video') ?? [], [venue]);
  const cars = useMemo(() => venue?.vendors.filter((v) => v.type === 'cortege') ?? [], [venue]);

  if (venueQ.isLoading) return <View style={[styles.fill, { paddingTop: insets.top }]}><Loading /></View>;
  if (venueQ.isError || !venue) {
    return (
      <View style={[styles.fill, { paddingTop: insets.top }]}>
        <ErrorState message={(venueQ.error as Error | null)?.message} onRetry={() => venueQ.refetch()} />
        <Button title="Orqaga" variant="ghost" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}>
        <Gallery
          photos={venue.photos}
          topInset={insets.top}
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          onShare={() => Share.share({ message: `${venue.name} — https://lokma.uz/toyxonalar/venue/${venue.slug}` })}
          isFavorite={isFavorite(venue.id)}
          onFavorite={() => toggle(venue.id)}
        />

        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{venue.name}</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#E8590C" />
              <Text style={styles.ratingText}>{venue.rating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({venue.reviews_count})</Text>
            </View>
          </View>
          <Text style={styles.address}>{venue.address} · sizdan {formatKm(venue.distance_km)}</Text>
          <View style={styles.facts}>
            <Fact value={`${venue.capacity_min}–${venue.capacity_max}`} label="mehmon" />
            <Fact value={`${venue.halls.length} zal`} label={venue.halls.map((h) => h.name.split(' ')[0].toLowerCase()).join(' va ')} />
            <Fact value={venue.parking_spots ? String(venue.parking_spots) : '—'} label="parking" />
          </View>
        </View>

        {venue.halls.length > 1 && (
          <View style={[styles.section, styles.hallRow]}>
            {venue.halls.map((h, i) => (
              <Pressable key={h.id} onPress={() => { setHallIdx(i); setDate(null); }} style={[styles.hallBtn, i === hallIdx && styles.hallBtnOn]} accessibilityRole="radio" accessibilityState={{ checked: i === hallIdx }}>
                <Text style={[styles.hallName, i === hallIdx && { color: colors.white }]}>{h.name}</Text>
                <Text style={[styles.hallCap, i === hallIdx && { color: '#C9CCD3' }]}>{h.capacity_min}–{h.capacity_max}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <AvailabilityCalendar
            month={month}
            days={cal.data}
            loading={cal.isFetching}
            selected={date}
            onSelect={(d) => setDate(d)}
            canGoBack={toMonthKey(month) > today.slice(0, 7)}
            onMonthChange={(delta) => {
              setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
              setDate(null);
            }}
          />
        </View>

        {date && menu && (
          <View style={styles.section}>
            <SessionList
              date={date}
              day={selectedDay}
              sessions={venue.sessions}
              selected={session}
              onSelect={setSession}
              priceFor={(s) => pricePerGuest(menu, s, weekend, venue.weekend_factor)}
            />
          </View>
        )}

        {menu && (
          <View style={styles.section}>
            <MenuPicker
              packages={venue.menu_packages}
              selectedId={menu.id}
              onSelect={setMenuId}
              guests={guests}
              onGuests={setGuests}
              min={venue.guests_min}
              max={venue.guests_max}
              perGuest={sessionTpl ? pricePerGuest(menu, sessionTpl, weekend, venue.weekend_factor) : undefined}
              perGuestNote={`1 kishi uchun · ${sessionTpl ? SESSION_LABEL[sessionTpl.code].toLowerCase() : 'seans tanlang'}${weekend ? ', dam olish kuni' : ''}`}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.h}>Qulayliklar</Text>
          <View style={styles.amen}>
            {venue.amenities.map((a) => (
              <View key={a} style={styles.amenItem}>
                <Ionicons name="checkmark" size={16} color="#1F7A47" />
                <Text style={styles.amenText} numberOfLines={1}>{a}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <VendorSlider title="Videochilar" icon="videocam-outline" vendors={videos} selectedId={videoId} onToggle={(id) => setVideoId((c) => (c === id ? null : id))} />
        </View>
        <View style={styles.section}>
          <VendorSlider title="Kortej" icon="car-sport-outline" vendors={cars} selectedId={carId} onToggle={(id) => setCarId((c) => (c === id ? null : id))} />
        </View>

        <View style={styles.section}>
          <QuoteSummary quote={quoteReq ? quote.data : undefined} guests={guests} menuName={menu?.name ?? ''} depositPercent={venue.deposit_percent} />
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.barSub} numberOfLines={1}>{sessionFree ? subtitle : 'Bo‘sh kun va seansni tanlang'}</Text>
          <Text style={styles.barTotal}>{quoteReq && quote.data ? formatSum(quote.data.total) : '—'}</Text>
        </View>
        <Button title="Bron qilish" size="lg" disabled={!quoteReq || !quote.data} onPress={() => setSheet(true)} />
      </View>

      <BookingSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        request={quoteReq ? { ...quoteReq, event_type: eventType } : null}
        summary={{ title: `${venue.name} · ${hall?.name ?? ''}`, subtitle: `${subtitle} · ${guests} mehmon`, total: quote.data?.total ?? 0, deposit: quote.data?.deposit ?? 0 }}
      />
    </View>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factValue}>{value}</Text>
      <Text style={styles.factLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.white },
  section: { paddingHorizontal: layout.screenPadding, paddingTop: spacing[6] },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  name: { ...typography.h1, fontSize: 28, color: colors.text, flex: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 6 },
  ratingText: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, color: colors.text },
  reviews: { ...typography.body, color: colors.textSecondary },
  address: { ...typography.caption, fontSize: 14, color: colors.textSecondary, marginTop: 6 },
  facts: { flexDirection: 'row', gap: 8, marginTop: spacing[4] },
  fact: { flex: 1, backgroundColor: colors.background, borderRadius: 16, padding: 12, gap: 2 },
  factValue: { ...typography.h4, fontFamily: fontFamily.extraBold, color: colors.text },
  factLabel: { ...typography.caption, fontSize: 12, color: colors.textSecondary },
  hallRow: { flexDirection: 'row', gap: 8 },
  hallBtn: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 12 },
  hallBtnOn: { backgroundColor: colors.text, borderColor: colors.text },
  hallName: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, color: colors.text },
  hallCap: { ...typography.caption, fontSize: 12, color: colors.textSecondary },
  h: { ...typography.h3, fontFamily: fontFamily.extraBold, color: colors.text, marginBottom: spacing[3] },
  amen: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenItem: { width: '48.8%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.background, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 14 },
  amenText: { ...typography.captionMedium, color: colors.text, flex: 1 },
  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: layout.screenPadding, paddingTop: 12, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
  },
  barSub: { ...typography.caption, fontSize: 12, color: colors.textSecondary },
  barTotal: { ...typography.h4, fontFamily: fontFamily.extraBold, color: colors.text },
});
