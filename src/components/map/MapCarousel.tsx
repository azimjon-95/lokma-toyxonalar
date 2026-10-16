import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, radius, typography } from '../../theme';
import type { VenueListItem } from '../../types';
import { formatKm, formatNumber } from '../../lib/format';
import { relativeDayLabel, SESSION_LABEL } from '../../lib/dates';
import { usePrefetchVenue } from '../../hooks/queries';

const GAP = 12;
const SIDE = 16;

interface Props {
  venues: VenueListItem[];
  selectedId: string | null;
  /** fromUser: foydalanuvchi kartochkani suryapti (xarita unga uchsin) */
  onSelect: (id: string) => void;
  onOpen: (v: VenueListItem) => void;
  onDirections: (v: VenueListItem) => void;
}

/*
 * Xarita ostidagi kartochkalar: gorizontal, "snap" bilan. Surilganda xarita shu to'yxonaga uchadi,
 * xaritadagi belgi bosilsa — kartochka shu yerga siljiydi.
 */
export function MapCarousel({ venues, selectedId, onSelect, onOpen, onDirections }: Props) {
  const { width } = useWindowDimensions();
  const cardW = Math.min(width, 720) - SIDE * 2 - 26;
  const step = cardW + GAP;
  const scroller = useRef<ScrollView>(null);
  const programmatic = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(rise, { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 120, delay: 450 }).start();
  }, [rise]);

  // Tashqaridan (belgi bosilganda) tanlansa — kartochkaga siljiymiz
  useEffect(() => {
    const i = venues.findIndex((v) => v.id === selectedId);
    if (i < 0) return;
    programmatic.current = Date.now() + 800;
    scroller.current?.scrollTo({ x: i * step, animated: true });
  }, [selectedId, venues, step]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    if (Date.now() < programmatic.current) return;
    if (settle.current) clearTimeout(settle.current);
    // Surish to'xtagach (snap o'rnashgach) eng yaqin kartochka tanlanadi
    settle.current = setTimeout(() => {
      const i = Math.max(0, Math.min(venues.length - 1, Math.round(x / step)));
      const v = venues[i];
      if (v && v.id !== selectedId) onSelect(v.id);
    }, 140);
  }, [venues, step, selectedId, onSelect]);

  if (!venues.length) return null;
  // Veb'da snapToInterval ishlamaydi — CSS scroll-snap beramiz (har kartochka "start" ga yopishadi)
  const webSnap = Platform.OS === 'web' ? ({ scrollSnapType: 'x mandatory', scrollPaddingLeft: SIDE, scrollBehavior: 'smooth' } as object) : null;
  const cellSnap = Platform.OS === 'web' ? ({ scrollSnapAlign: 'start' } as object) : null;
  return (
    <Animated.View style={{ width: '100%', maxWidth: 720, opacity: rise, transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] }}>
      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        style={webSnap}
        contentContainerStyle={{ paddingHorizontal: SIDE, gap: GAP, paddingVertical: 14 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {venues.map((v) => (
          <View key={v.id} style={cellSnap}>
            <Card v={v} width={cardW} active={v.id === selectedId} onOpen={onOpen} onDirections={onDirections} />
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

function Card({ v, width, active, onOpen, onDirections }: { v: VenueListItem; width: number; active: boolean; onOpen: (v: VenueListItem) => void; onDirections: (v: VenueListItem) => void }) {
  const scale = useRef(new Animated.Value(active ? 1 : 0.96)).current;
  const prefetch = usePrefetchVenue();
  // Tanlangan (ko'rinib turgan) to'yxona sahifasi oldindan yuklanadi — "Ochish" bosilganda tayyor
  useEffect(() => { if (active) prefetch(v.slug); }, [active, prefetch, v.slug]);
  useEffect(() => { Animated.spring(scale, { toValue: active ? 1 : 0.96, useNativeDriver: true, damping: 14, stiffness: 180 }).start(); }, [active, scale]);
  return (
    <Animated.View style={{ transform: [{ scale }], width }}>
      <Pressable onPress={() => onOpen(v)} onPressIn={() => prefetch(v.slug)} accessibilityRole="button" accessibilityLabel={`${v.name}ni ochish`} style={[styles.card, active && styles.cardOn]}>
        <View style={styles.photoWrap}>
          <Image source={v.photos[0]} style={styles.photo} contentFit="cover" transition={250} />
          <View style={styles.rating}>
            <Ionicons name="star" size={11} color="#E8590C" />
            <Text style={styles.ratingText}>{v.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>{v.name}</Text>
          <Text style={styles.meta} numberOfLines={1}>{formatKm(v.distance_km)} · {v.capacity_min}–{v.capacity_max} mehmon</Text>
          {v.next_free ? (
            <Text style={styles.free} numberOfLines={1}>● Bo‘sh: {relativeDayLabel(v.next_free.date).toLowerCase()}, {SESSION_LABEL[v.next_free.session].toLowerCase()}</Text>
          ) : (
            <Text style={styles.busy}>Yaqin kunlarda band</Text>
          )}
          <View style={styles.row}>
            <Text style={styles.price}>{formatNumber(v.price_from)} <Text style={styles.unit}>so‘m dan</Text></Text>
            <Pressable onPress={() => onDirections(v)} hitSlop={8} style={styles.route} accessibilityRole="button" accessibilityLabel={`${v.name}ga yo'l ko'rsatish`}>
              <Ionicons name="navigate" size={16} color={colors.primary} />
            </Pressable>
            <View style={styles.open}><Text style={styles.openText}>Ochish</Text></View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, padding: 10, backgroundColor: colors.white, borderRadius: radius.cardLg, borderWidth: 1.5, borderColor: 'transparent', shadowColor: '#2a1a20', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  cardOn: { borderColor: colors.primary },
  photoWrap: { width: 92, height: 112 },
  photo: { width: 92, height: 112, borderRadius: 16, backgroundColor: colors.primaryLight },
  rating: { position: 'absolute', left: 6, top: 6, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3 },
  ratingText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.text },
  body: { flex: 1, minWidth: 0, justifyContent: 'space-between', paddingVertical: 2 },
  name: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.text },
  meta: { ...typography.caption, color: colors.textSecondary },
  free: { fontFamily: fontFamily.medium, fontSize: 12, color: '#1F7A47' },
  busy: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { flex: 1, fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.text },
  unit: { fontFamily: fontFamily.regular, color: colors.textSecondary, fontSize: 12 },
  route: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  open: { backgroundColor: colors.primary, borderRadius: 17, paddingHorizontal: 14, height: 34, alignItems: 'center', justifyContent: 'center' },
  openText: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.white },
});
