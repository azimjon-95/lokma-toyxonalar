import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, fontFamily } from '../../theme';
import type { MenuPackage } from '../../types';
import { formatShort, formatSum } from '../../lib/format';

const STEP = 10;

export function MenuPicker({ packages, selectedId, onSelect, guests, onGuests, min, max, perGuest, perGuestNote }: {
  packages: MenuPackage[];
  selectedId: string;
  onSelect: (id: string) => void;
  guests: number;
  onGuests: (n: number) => void;
  min: number;
  max: number;
  perGuest: number | undefined;
  perGuestNote: string;
}) {
  const selected = packages.find((p) => p.id === selectedId);
  return (
    <View style={{ gap: spacing[3] }}>
      <Text style={styles.h}>Menyu va narx</Text>
      <View style={styles.segment}>
        {packages.map((p) => {
          const on = p.id === selectedId;
          return (
            <Pressable key={p.id} onPress={() => onSelect(p.id)} style={[styles.seg, on && styles.segOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
              <Text style={[styles.segName, !on && { color: colors.textSecondary }]}>{p.name}</Text>
              <Text style={[styles.segPrice, on && { color: colors.primaryDark, fontFamily: fontFamily.bold }]}>{formatShort(p.price_per_guest)}</Text>
            </Pressable>
          );
        })}
      </View>
      {!!selected && <Text style={styles.items}>{selected.items_text}</Text>}

      <View style={styles.guests}>
        <View>
          <Text style={styles.gTitle}>Mehmonlar</Text>
          <Text style={styles.gSub}>{min} – {max} kishi</Text>
        </View>
        <View style={styles.stepper}>
          <Pressable onPress={() => onGuests(Math.max(min, guests - STEP))} onLongPress={() => onGuests(Math.max(min, guests - 100))} style={styles.stepBtn} accessibilityLabel="Kamaytirish">
            <Ionicons name="remove" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.gValue}>{guests}</Text>
          <Pressable onPress={() => onGuests(Math.min(max, guests + STEP))} onLongPress={() => onGuests(Math.min(max, guests + 100))} style={[styles.stepBtn, styles.stepBtnDark]} accessibilityLabel="Ko‘paytirish">
            <Ionicons name="add" size={20} color={colors.white} />
          </Pressable>
        </View>
      </View>

      <View style={styles.per}>
        <Text style={styles.perNote}>{perGuestNote}</Text>
        <Text style={styles.perValue}>{perGuest ? formatSum(perGuest) : '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  h: { ...typography.h3, fontFamily: fontFamily.extraBold, color: colors.text },
  segment: { flexDirection: 'row', gap: 4, backgroundColor: colors.background, borderRadius: 16, padding: 4 },
  seg: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 12 },
  segOn: { backgroundColor: colors.white, shadowColor: '#111318', shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  segName: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, fontSize: 14, color: colors.text },
  segPrice: { ...typography.caption, fontSize: 11, color: colors.textSecondary },
  items: { ...typography.caption, color: colors.textSecondary },
  guests: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingVertical: 10, paddingLeft: 16, paddingRight: 10 },
  gTitle: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, color: colors.text },
  gSub: { ...typography.caption, fontSize: 12, color: colors.textSecondary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepBtnDark: { backgroundColor: colors.text, borderColor: colors.text },
  gValue: { ...typography.h4, fontFamily: fontFamily.extraBold, minWidth: 44, textAlign: 'center', color: colors.text },
  per: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF1E8', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 },
  perNote: { ...typography.caption, color: '#7A2E06', flex: 1 },
  perValue: { ...typography.bodySemiBold, fontFamily: fontFamily.extraBold, fontSize: 16, color: '#7A2E06' },
});
