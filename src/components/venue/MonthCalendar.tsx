import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamily } from '../../theme';
import type { CalendarDay } from '../../types';
import { MONTHS_CAP, SESSION_ORDER, WEEKDAYS_SHORT, parseISODate, startOfToday, toISODate } from '../../lib/dates';
import { SectionTitle } from './SectionTitle';

type DayState = 'past' | 'free' | 'partial' | 'busy' | 'unknown';

function stateOf(day: CalendarDay | undefined, iso: string, today: string): DayState {
  if (iso < today) return 'past';
  if (!day) return 'unknown';
  const n = SESSION_ORDER.filter((s) => day.sessions[s] === 'free').length;
  return n === 3 ? 'free' : n === 0 ? 'busy' : 'partial';
}

interface Props {
  /** Ko'rsatilayotgan oyning 1-kuni */
  month: Date;
  days: Map<string, CalendarDay>;
  loading: boolean;
  selected: string | null;
  onSelect: (iso: string) => void;
  /** -1 / +1 oy */
  onShift: (delta: number) => void;
  onPickMonth: (month: Date) => void;
}

/*
 * "Bo'sh kunlar" — TO'LIQ OY (maket uslubida):
 *   sarlavha + oy tanlash (pastdan ochiladigan ro'yxat), yon tomonlarda ‹ › — oy almashadi,
 *   kunlar doira ichida; ostida 3 nuqta — nahor/kunduz/kechki (yashil — bo'sh).
 */
export function MonthCalendar({ month, days, loading, selected, onSelect, onShift, onPickMonth }: Props) {
  const [picker, setPicker] = useState(false);
  const today = toISODate(startOfToday());
  // Dushanbadan boshlanadigan to'liq haftalar; oyga tegishli bo'lmagan kataklar bo'sh
  const weeks = useMemo(() => {
    const lead = (month.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (string | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= count; d++) cells.push(toISODate(new Date(month.getFullYear(), month.getMonth(), d)));
    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  }, [month]);
  const t = startOfToday();
  const canPrev = month.getFullYear() * 12 + month.getMonth() > t.getFullYear() * 12 + t.getMonth();
  const monthLabel = `${MONTHS_CAP[month.getMonth()]} ${month.getFullYear()}`;

  return (
    <View style={{ gap: 14 }}>
      <SectionTitle
        icon="calendar-month-outline"
        title="Bo‘sh kunlar"
        right={
          <Pressable onPress={() => setPicker(true)} accessibilityRole="button" accessibilityLabel={`Oy: ${monthLabel}. O‘zgartirish`} style={styles.monthPill}>
            {loading && <ActivityIndicator size="small" color={colors.goldMid} style={{ transform: [{ scale: 0.7 }] }} />}
            <Text style={styles.monthText}>{monthLabel}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.goldText} />
          </Pressable>
        }
      />

      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <View style={styles.week}>
            {WEEKDAYS_SHORT.map((w) => <Text key={w} style={styles.weekday}>{w}</Text>)}
          </View>
          {weeks.map((week, row) => (
            <View key={row} style={styles.week}>
              {week.map((iso, i) => iso
                ? <DayCell key={iso} iso={iso} day={days.get(iso)} state={stateOf(days.get(iso), iso, today)} selected={iso === selected} onPress={() => onSelect(iso)} />
                : <View key={`e${row}-${i}`} style={styles.cellBox} />)}
            </View>
          ))}
        </View>
        <SideArrow side="left" disabled={!canPrev} onPress={() => onShift(-1)} />
        <SideArrow side="right" onPress={() => onShift(1)} />
      </View>

      <View style={styles.legend}>
        <LegendChip dot={colors.wineDot} label="Hammasi bo‘sh" boxed />
        <LegendChip dot="#EED9C4" label="Qisman band" />
        <LegendChip dot="#D6D6D9" label="To‘liq band" />
      </View>
      <View style={styles.dotsLegend}>
        <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
        <Text style={styles.legendText}>Nuqtalar: nahor · kunduz · kechki</Text>
      </View>

      <MonthPicker visible={picker} onClose={() => setPicker(false)} onPick={(m) => { setPicker(false); onPickMonth(m); }} />
    </View>
  );
}

function DayCell({ iso, day, state, selected, onPress }: { iso: string; day?: CalendarDay; state: DayState; selected: boolean; onPress: () => void }) {
  const n = parseISODate(iso).getDate();
  const disabled = state === 'past';
  const label = { past: 'o‘tgan', free: 'hammasi bo‘sh', partial: 'qisman band', busy: 'to‘liq band', unknown: '' }[state];
  const inner = (
    <>
      <Text style={[styles.num, state === 'past' && styles.numPast, state === 'busy' && styles.numBusy, selected && styles.numSel]}>{n}</Text>
      {state !== 'past' && day && (
        <View style={styles.dots}>
          {SESSION_ORDER.map((s) => {
            const f = day.sessions[s] === 'free';
            return <View key={s} style={[styles.dot, { backgroundColor: selected ? (f ? '#FFFFFF' : 'rgba(255,255,255,0.35)') : f ? colors.success : '#D3D3D6' }]} />;
          })}
        </View>
      )}
    </>
  );
  return (
    <View style={styles.cellBox}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={`${n}-kun${label ? `, ${label}` : ''}`}
        style={({ pressed }) => [pressed && !disabled && { transform: [{ scale: 0.92 }] }]}
      >
        {selected ? (
          <LinearGradient colors={['#C2365F', colors.primary, colors.wineDeep]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[styles.circle, styles.circleSel]}>
            {inner}
          </LinearGradient>
        ) : (
          <View style={[styles.circle, styles[`c_${state}`]]}>{inner}</View>
        )}
      </Pressable>
      {selected && <View style={styles.selDot} />}
    </View>
  );
}

function SideArrow({ side, onPress, disabled }: { side: 'left' | 'right'; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={side === 'left' ? 'Oldingi oy' : 'Keyingi oy'}
      style={[styles.arrow, side === 'left' ? { left: -19 } : { right: -19 }, disabled && { opacity: 0.35 }]}
    >
      <Ionicons name={side === 'left' ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.primary} />
    </Pressable>
  );
}

function LegendChip({ dot, label, boxed }: { dot: string; label: string; boxed?: boolean }) {
  return (
    <View style={[styles.chip, boxed && styles.chipBoxed]}>
      <View style={[styles.legendDot, { backgroundColor: dot, width: 11, height: 11, borderRadius: 6 }]} />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function MonthPicker({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (m: Date) => void }) {
  const insets = useSafeAreaInsets();
  const t = startOfToday();
  const months = Array.from({ length: 12 }, (_, i) => new Date(t.getFullYear(), t.getMonth() + i, 1));
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Yopish" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>Oyni tanlang</Text>
        <ScrollView contentContainerStyle={styles.monthGrid}>
          {months.map((m) => (
            <Pressable key={m.toISOString()} onPress={() => onPick(m)} style={({ pressed }) => [styles.monthBtn, pressed && { backgroundColor: colors.wineSoft }]}>
              <Text style={styles.monthBtnText}>{MONTHS_CAP[m.getMonth()]}</Text>
              <Text style={styles.monthBtnYear}>{m.getFullYear()}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const CIRCLE = 40;
const styles = StyleSheet.create({
  monthPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 38, borderRadius: 19, backgroundColor: '#F6EEE4' },
  monthText: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.goldText },
  cardWrap: { marginHorizontal: 24 },
  card: {
    backgroundColor: colors.white, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 8, gap: 6,
    shadowColor: '#7A5A3A', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2,
  },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontFamily: fontFamily.medium, fontSize: 12, color: '#6F665E', paddingBottom: 4 },
  cellBox: { flex: 1, alignItems: 'center', paddingVertical: 3, minHeight: CIRCLE + 12 },
  circle: { width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2, alignItems: 'center', justifyContent: 'center' },
  c_past: { backgroundColor: 'transparent' },
  c_free: { backgroundColor: '#FBF1F3' },
  c_partial: { backgroundColor: colors.beigeDay },
  c_busy: { backgroundColor: '#F1F1F2' },
  c_unknown: { backgroundColor: '#F7F2EC' },
  circleSel: { shadowColor: colors.wineDeep, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  num: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.text, lineHeight: 18 },
  numPast: { color: '#C2BDB8' },
  numBusy: { color: '#A3A3A8', textDecorationLine: 'line-through' },
  numSel: { color: colors.white, fontFamily: fontFamily.semiBold },
  dots: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  selDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 3 },
  arrow: {
    position: 'absolute', top: '50%', marginTop: -15, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7A5A3A', shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, paddingHorizontal: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 16 },
  chipBoxed: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#F0E6DB' },
  chipText: { fontFamily: fontFamily.regular, fontSize: 12.5, color: colors.text },
  dotsLegend: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, marginTop: -6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: fontFamily.regular, fontSize: 13, color: '#4F4A45' },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,14,12,0.4)' },
  sheet: { backgroundColor: colors.page, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 16, maxHeight: '70%' },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: '#E2D8CC', marginBottom: 12 },
  sheetTitle: { fontFamily: fontFamily.serif, fontSize: 22, color: colors.text, marginBottom: 12 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  monthBtn: { width: '31%', flexGrow: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', borderWidth: 1, borderColor: '#F0E6DB' },
  monthBtnText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.text },
  monthBtnYear: { fontFamily: fontFamily.regular, fontSize: 12, color: '#8A8178', marginTop: 2 },
});
