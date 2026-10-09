import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import type { CalendarDay, SessionCode, SessionTemplate } from '../../types';
import { formatDayLong } from '../../lib/dates';
import { formatShort } from '../../lib/format';
import { SectionTitle } from './SectionTitle';

interface Props {
  date: string;
  day: CalendarDay | undefined;
  sessions: SessionTemplate[];
  selected: SessionCode | null;
  recommended: SessionCode | null;
  onSelect: (s: SessionCode) => void;
  priceFor: (s: SessionTemplate) => number;
  onPrevDay: () => void;
  onNextDay: () => void;
  canPrevDay: boolean;
}

/*
 * Tanlangan kun va bo'sh vaqtlar: gorizontal chiplar.
 * Tanlangani — vino gradient (ichki yaltirash bilan), tavsiya etilgani ustida "Tavsiya".
 */
export function DaySlots({ date, day, sessions, selected, recommended, onSelect, priceFor, onPrevDay, onNextDay, canPrevDay }: Props) {
  return (
    <View style={{ gap: 14 }}>
      <SectionTitle
        icon="clock-outline"
        title={formatDayLong(date)}
        subtitle="Bo‘sh vaqtlar"
        right={
          <View style={styles.navs}>
            <NavBtn icon="chevron-back" label="Oldingi kun" onPress={onPrevDay} disabled={!canPrevDay} />
            <NavBtn icon="chevron-forward" label="Keyingi kun" onPress={onNextDay} />
          </View>
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {sessions.map((s) => {
          const status = day?.sessions[s.code] ?? 'booked';
          const free = status === 'free';
          const on = free && selected === s.code;
          const rec = free && recommended === s.code;
          const body = (
            <>
              <Text style={[styles.time, on && styles.timeOn, !free && styles.off]}>{s.start_time}–{s.end_time}</Text>
              <View style={styles.priceRow}>
                <View style={[styles.dot, { backgroundColor: free ? (on ? '#7CE0A3' : colors.success) : '#C9C9CD' }]} />
                <Text style={[styles.price, on && styles.priceOn, !free && styles.off]}>
                  {free ? formatShort(priceFor(s)) : status === 'hold' ? 'Band qilinmoqda' : 'Band'}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={on ? colors.white : '#A39D97'} />
              </View>
            </>
          );
          return (
            <View key={s.code} style={styles.slotBox}>
              {rec && (
                <View style={styles.tag}>
                  <Ionicons name="star" size={11} color={colors.goldMid} />
                  <Text style={styles.tagText}>Tavsiya</Text>
                </View>
              )}
              <Pressable
                onPress={() => onSelect(s.code)}
                disabled={!free}
                accessibilityRole="radio"
                accessibilityState={{ checked: on, disabled: !free }}
                accessibilityLabel={`${s.start_time}–${s.end_time}, ${free ? formatShort(priceFor(s)) + ' so‘m kishi boshiga' : 'band'}`}
                style={({ pressed }) => [pressed && free && { transform: [{ scale: 0.96 }] }]}
              >
                {on ? (
                  <LinearGradient colors={['#C2365F', colors.primary, colors.wineDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.slot, styles.slotOn]}>
                    {/* Ichki yaltirash: yuqori chetda nozik oq chiziq va ichki oltin hoshiya */}
                    <View style={styles.shine} />
                    <View style={styles.innerRing} />
                    {body}
                  </LinearGradient>
                ) : (
                  <View style={[styles.slot, !free && styles.slotOff]}>{body}</View>
                )}
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function NavBtn({ icon, label, onPress, disabled }: { icon: 'chevron-back' | 'chevron-forward'; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={6} accessibilityRole="button" accessibilityLabel={label} style={[styles.nav, disabled && { opacity: 0.35 }]}>
      <Ionicons name={icon} size={17} color={icon === 'chevron-back' ? colors.goldText : colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navs: { flexDirection: 'row', gap: 8 },
  nav: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#EDE3D8', backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  row: { gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  slotBox: { alignItems: 'center' },
  slot: {
    minWidth: 142, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.white, gap: 6,
    borderWidth: 1, borderColor: '#F0E6DB',
    shadowColor: '#7A5A3A', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  slotOn: {
    borderWidth: 0, overflow: 'hidden',
    shadowColor: colors.wineDeep, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  slotOff: { backgroundColor: '#F7F5F2', shadowOpacity: 0 },
  shine: { position: 'absolute', top: 0, left: 14, right: 14, height: 1.5, backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 1 },
  innerRing: { position: 'absolute', top: 2, left: 2, right: 2, bottom: 2, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(230,199,137,0.55)' },
  time: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.text },
  timeOn: { color: colors.white },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  price: { flex: 1, fontFamily: fontFamily.regular, fontSize: 13.5, color: '#6F665E' },
  priceOn: { color: colors.white },
  off: { color: '#A39D97' },
  tag: {
    position: 'absolute', top: -2, zIndex: 2, flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: colors.white,
    shadowColor: '#7A5A3A', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  tagText: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.primary },
});
