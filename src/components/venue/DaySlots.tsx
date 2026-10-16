import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import type { CalendarDay, SessionCode, SessionTemplate } from '../../types';
import { SESSION_TITLE } from '../../lib/dates';
import { formatShort } from '../../lib/format';

interface Props {
  day: CalendarDay | undefined;
  sessions: SessionTemplate[];
  selected: SessionCode | null;
  recommended: SessionCode | null;
  onSelect: (s: SessionCode) => void;
  priceFor: (s: SessionTemplate) => number;
}

/*
 * Tanlangan kunning seanslari: gorizontal kartalar. Har kartada ichida, vaqt tepasida — seans nomi (Nahorgi osh / ...).
 * Bo'sh — narx bilan; band — o'chirilgan (bosilmaydi), "Band" yozuvi va qulf belgisi bilan.
 * Tanlangani — vino gradient (ichki yaltirash bilan), tavsiya etilgani ustida "Tavsiya".
 */
export function DaySlots({ day, sessions, selected, recommended, onSelect, priceFor }: Props) {
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {sessions.map((s) => {
          const status = day?.sessions[s.code] ?? 'booked';
          const free = status === 'free';
          const on = free && selected === s.code;
          const rec = free && recommended === s.code;
          const body = (
            <>
              <View style={[styles.chip, on && styles.chipOn, !free && styles.chipOff]}>
                <Text style={[styles.chipText, on && styles.chipTextOn, !free && styles.off]} numberOfLines={1}>{SESSION_TITLE[s.code]}</Text>
              </View>
              <Text style={[styles.time, on && styles.timeOn, !free && styles.off, !free && styles.timeStruck]}>{s.start_time}–{s.end_time}</Text>
              <View style={styles.priceRow}>
                <View style={[styles.dot, { backgroundColor: free ? (on ? '#7CE0A3' : colors.success) : '#C9C9CD' }]} />
                <Text style={[styles.price, on && styles.priceOn, !free && styles.busyText]}>
                  {free ? formatShort(priceFor(s)) : status === 'hold' ? 'Band qilinmoqda' : 'Band'}
                </Text>
                <Ionicons name={free ? 'chevron-forward' : 'lock-closed'} size={free ? 14 : 12} color={on ? colors.white : '#A39D97'} />
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
                accessibilityLabel={`${SESSION_TITLE[s.code]}, ${s.start_time}–${s.end_time}, ${free ? formatShort(priceFor(s)) + ' so‘m kishi boshiga' : 'band'}`}
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

const styles = StyleSheet.create({
  row: { gap: 10, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
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
  chip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9, backgroundColor: '#FBF1E6' },
  chipOn: { backgroundColor: 'rgba(255,255,255,0.2)' },
  chipOff: { backgroundColor: '#ECEAE7' },
  chipText: { fontFamily: fontFamily.semiBold, fontSize: 10.5, color: '#8A5A2B' },
  chipTextOn: { color: colors.white },
  time: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.text },
  timeStruck: { textDecorationLine: 'line-through' },
  busyText: { color: '#8C867F', fontFamily: fontFamily.semiBold },
  timeOn: { color: colors.white },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  price: { flex: 1, fontFamily: fontFamily.regular, fontSize: 13.5, color: '#6F665E' },
  priceOn: { color: colors.white },
  off: { color: '#A39D97' },
  tag: {
    position: 'absolute', top: -13, zIndex: 2, flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: colors.white,
    shadowColor: '#7A5A3A', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  tagText: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.primary },
});
