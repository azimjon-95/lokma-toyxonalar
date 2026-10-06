import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography, fontFamily } from '../../theme';
import type { CalendarDay, SessionCode } from '../../types';
import { MONTHS_CAP, SESSION_ORDER, WEEKDAYS_SHORT, parseISODate, toISODate, startOfToday, weekdayIndex } from '../../lib/dates';
import { IconButton } from '../ui/IconButton';

type DayState = 'past' | 'free' | 'partial' | 'busy';

function stateOf(day: CalendarDay | undefined, iso: string, today: string): DayState {
  if (iso < today || !day) return 'past';
  const free = SESSION_ORDER.filter((s) => day.sessions[s] === 'free').length;
  return free === 3 ? 'free' : free === 0 ? 'busy' : 'partial';
}

interface Props {
  month: Date; // oyning 1-kuni
  days: CalendarDay[] | undefined;
  loading: boolean;
  selected: string | null;
  onSelect: (iso: string) => void;
  onMonthChange: (delta: number) => void;
  canGoBack: boolean;
}

export function AvailabilityCalendar({ month, days, loading, selected, onSelect, onMonthChange, canGoBack }: Props) {
  const today = toISODate(startOfToday());
  const byDate = useMemo(() => new Map(days?.map((d) => [d.date, d])), [days]);

  const weeks = useMemo(() => {
    const lead = weekdayIndex(month);
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (string | null)[] = [...Array(lead).fill(null)];
    for (let d = 1; d <= count; d++) cells.push(toISODate(new Date(month.getFullYear(), month.getMonth(), d)));
    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  }, [month]);

  return (
    <View style={{ gap: spacing[3] }}>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Bo‘sh kunlar</Text>
          <Text style={styles.sub}>{MONTHS_CAP[month.getMonth()]} {month.getFullYear()}</Text>
        </View>
        <View style={styles.nav}>
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
          <IconButton icon="chevron-back" label="Oldingi oy" variant="outline" onPress={() => canGoBack && onMonthChange(-1)} style={!canGoBack ? { opacity: 0.35 } : undefined} />
          <IconButton icon="chevron-forward" label="Keyingi oy" variant="outline" onPress={() => onMonthChange(1)} />
        </View>
      </View>

      <View style={styles.box}>
        <View style={styles.week}>
          {WEEKDAYS_SHORT.map((w) => (
            <Text key={w} style={styles.weekday}>{w}</Text>
          ))}
        </View>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.week}>
            {week.map((iso, di) => {
              if (!iso) return <View key={di} style={styles.cell} />;
              const day = byDate.get(iso);
              const st = stateOf(day, iso, today);
              const isSel = iso === selected;
              const n = parseISODate(iso).getDate();
              return (
                <Pressable
                  key={iso}
                  disabled={st === 'past'}
                  onPress={() => onSelect(iso)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSel, disabled: st === 'past' }}
                  accessibilityLabel={`${n}-kun, ${st === 'free' ? 'hammasi bo‘sh' : st === 'partial' ? 'qisman band' : st === 'busy' ? 'to‘liq band' : 'o‘tgan'}`}
                  style={[styles.cell, styles[`c_${st}`], isSel && styles.cellSelected]}
                >
                  <Text style={[styles.num, st === 'past' && { color: '#B4B7BF' }, st === 'busy' && styles.numBusy, isSel && { color: colors.white }]}>{n}</Text>
                  {st !== 'past' && (
                    <View style={styles.dots}>
                      {SESSION_ORDER.map((s: SessionCode) => {
                        const f = day?.sessions[s] === 'free';
                        return <View key={s} style={[styles.dot, { backgroundColor: isSel ? (f ? '#7CE0A3' : '#5C6170') : f ? colors.success : colors.booked }]} />;
                      })}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <Legend color={colors.freeBg} label="Hammasi bo‘sh" />
        <Legend color={colors.white} border label="Qisman band" />
        <Legend color={colors.bookedBg} label="To‘liq band" />
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>nuqtalar: nahor · kunduz · kechki</Text>
        </View>
      </View>
    </View>
  );
}

function Legend({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendBox, { backgroundColor: color }, border && { borderWidth: 1, borderColor: '#DADCE1' }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h3, fontFamily: fontFamily.extraBold, color: colors.text },
  sub: { ...typography.caption, color: colors.textSecondary },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, paddingHorizontal: 8, paddingVertical: 10, gap: 4 },
  week: { flexDirection: 'row', gap: 4 },
  weekday: { flex: 1, textAlign: 'center', ...typography.captionMedium, fontSize: 11, color: '#6B7080', paddingBottom: 4 },
  cell: { flex: 1, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 6 },
  c_past: {},
  c_free: { backgroundColor: colors.freeBg },
  c_partial: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#DADCE1' },
  c_busy: { backgroundColor: colors.bookedBg },
  cellSelected: { backgroundColor: colors.text, borderWidth: 0 },
  num: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, color: colors.text },
  numBusy: { color: '#9A9EA8', textDecorationLine: 'line-through' },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: { width: 14, height: 14, borderRadius: 4 },
  legendText: { ...typography.caption, fontSize: 12, color: colors.textSecondary },
});
