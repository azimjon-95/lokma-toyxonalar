import React, { useEffect, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, radius, spacing, typography } from '../../theme';
import type { FreeSoonItem } from '../../types';
import { formatKm, formatNumber } from '../../lib/format';
import { relativeDayLabel, SESSION_LABEL } from '../../lib/dates';

const GAP = 12;
const AUTOPLAY_MS = 4000;

interface Props {
  items: FreeSoonItem[];
  onPress: (slug: string) => void;
}

export function FreeSoonCarousel({ items, onPress }: Props) {
  const { width } = useWindowDimensions();
  const cardW = Math.min(width - layout.screenPadding * 2 - 28, 420);
  const step = cardW + GAP;
  const ref = useRef<FlatList<FreeSoonItem>>(null);
  const [index, setIndex] = useState(0);
  const touching = useRef(false);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => {
      if (touching.current) return;
      setIndex((i) => {
        const next = (i + 1) % items.length;
        ref.current?.scrollToOffset({ offset: next * step, animated: true });
        return next;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [items.length, step]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    touching.current = false;
    setIndex(Math.max(0, Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.x / step))));
  };

  return (
    <View>
      <FlatList
        ref={ref}
        data={items}
        horizontal
        keyExtractor={(it) => `${it.venue.id}-${it.date}-${it.session}`}
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: layout.screenPadding, gap: GAP }}
        onScrollBeginDrag={() => (touching.current = true)}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: step, offset: step * i, index: i })}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPress(item.venue.slug)}
            style={({ pressed }) => [styles.card, { width: cardW }, pressed && { opacity: 0.94 }]}
            accessibilityRole="button"
            accessibilityLabel={`${item.venue.name}, ${relativeDayLabel(item.date)} ${SESSION_LABEL[item.session]} bo‘sh`}
          >
            <Image source={item.venue.photos[0]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
            <View style={styles.badge}>
              <View style={styles.dot} />
              <Text style={styles.badgeText}>
                {relativeDayLabel(item.date)} · {SESSION_LABEL[item.session]}
              </Text>
            </View>
            <View style={styles.panel}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{item.venue.name}</Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {formatKm(item.venue.distance_km)} · {formatNumber(item.venue.price_from)} so‘m dan
                </Text>
              </View>
              <View style={styles.go}>
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              </View>
            </View>
          </Pressable>
        )}
      />
      {items.length > 1 && (
        <View style={styles.dots}>
          {items.map((_, i) => (
            <View key={i} style={[styles.pageDot, i === index && styles.pageDotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: 236, borderRadius: radius.cardLg, overflow: 'hidden', backgroundColor: colors.primaryLight },
  badge: {
    position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  badgeText: { ...typography.captionMedium, fontSize: 12, color: colors.text },
  panel: {
    position: 'absolute', left: 10, right: 10, bottom: 10, backgroundColor: colors.white, borderRadius: 18,
    paddingVertical: 12, paddingLeft: 14, paddingRight: 12, flexDirection: 'row', alignItems: 'center', gap: spacing[3],
  },
  name: { ...typography.bodySemiBold, fontSize: 16, color: colors.text },
  meta: { ...typography.caption, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  go: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing[3] },
  pageDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D5D7DD' },
  pageDotActive: { width: 22, backgroundColor: colors.text },
});
