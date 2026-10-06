import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, fontFamily } from '../../theme';
import type { CalendarDay, SessionCode, SessionTemplate } from '../../types';
import { SESSION_LABEL, formatDayLong } from '../../lib/dates';
import { formatShort } from '../../lib/format';

const EVENT_LABEL: Record<string, string> = { nahorgi_osh: 'Nahorgi osh', nikoh: 'Nikoh to‘yi', kunduzgi: 'Kunduzgi to‘y', kechki: 'Kechki to‘y' };

export function SessionList({ date, day, sessions, selected, onSelect, priceFor }: {
  date: string;
  day: CalendarDay | undefined;
  sessions: SessionTemplate[];
  selected: SessionCode | null;
  onSelect: (s: SessionCode) => void;
  priceFor: (s: SessionTemplate) => number;
}) {
  return (
    <View style={{ gap: spacing[2] }}>
      <Text style={styles.date}>{formatDayLong(date)}</Text>
      {sessions.map((s) => {
        const status = day?.sessions[s.code] ?? 'booked';
        const free = status === 'free';
        const on = free && selected === s.code;
        return (
          <Pressable
            key={s.code}
            disabled={!free}
            onPress={() => onSelect(s.code)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on, disabled: !free }}
            style={[styles.row, on ? styles.rowOn : free ? null : styles.rowOff]}
          >
            <View style={[styles.radio, on && styles.radioOn]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {SESSION_LABEL[s.code]} <Text style={styles.time}>· {s.start_time}–{s.end_time}</Text>
              </Text>
              <Text style={styles.types}>{s.event_types.map((e) => EVENT_LABEL[e]).join(' · ')}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.price}>{formatShort(priceFor(s))}</Text>
              <Text style={[styles.status, { color: free ? '#1F7A47' : '#9A9EA8' }]}>
                {on ? 'Tanlandi' : free ? 'Bo‘sh' : status === 'hold' ? 'Band qilinmoqda' : 'Band'}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  date: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, fontSize: 16, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  rowOn: { borderWidth: 2, borderColor: colors.primary, backgroundColor: '#FFF8F3' },
  rowOff: { backgroundColor: '#F7F7F8', opacity: 0.6 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C3C6CD' },
  radioOn: { borderWidth: 7, borderColor: colors.primary },
  title: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, color: colors.text },
  time: { fontFamily: fontFamily.medium, color: colors.textSecondary },
  types: { ...typography.caption, fontSize: 12, color: colors.textSecondary },
  price: { ...typography.bodySemiBold, fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.text },
  status: { ...typography.captionMedium, fontSize: 11 },
});
