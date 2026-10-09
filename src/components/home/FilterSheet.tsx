import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../theme';
import type { EventTypeCode, QuickFilter, SortKey } from '../../types';
import { Chip } from '../ui/Chip';
import { Button } from '../ui/Button';

export interface AdvancedFilter {
  quick: QuickFilter;
  event_type?: EventTypeCode;
  sort: SortKey;
  radiusKm: number;
}

const EVENTS: { code: EventTypeCode; label: string }[] = [
  { code: 'nahorgi_osh', label: 'Nahorgi osh' },
  { code: 'nikoh', label: 'Nikoh to‘yi' },
  { code: 'kunduzgi', label: 'Kunduzgi to‘y' },
  { code: 'kechki', label: 'Kechki to‘y' },
];
const SORTS: { code: SortKey; label: string }[] = [
  { code: 'distance', label: 'Eng yaqin' },
  { code: 'price_asc', label: 'Arzonroq' },
  { code: 'price_desc', label: 'Qimmatroq' },
  { code: 'rating', label: 'Reyting' },
];
const RADII = [10, 20, 50];
const QUICK: { code: QuickFilter; label: string }[] = [
  { code: 'all', label: 'Hammasi' },
  { code: 'free_today', label: 'Bugun bo‘sh' },
  { code: 'cheap', label: '150 ming gacha' },
  { code: 'big', label: '500+ mehmon' },
  { code: 'parking', label: 'Parking' },
];

interface Props {
  visible: boolean;
  value: AdvancedFilter;
  onClose: () => void;
  onApply: (v: AdvancedFilter) => void;
}

export function FilterSheet({ visible, value, onClose, onApply }: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Yopish" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing[4] }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Filtr</Text>

        <Text style={styles.label}>Tezkor</Text>
        <View style={styles.row}>
          {QUICK.map((q) => (
            <Chip key={q.code} label={q.label} selected={draft.quick === q.code} onPress={() => setDraft((d) => ({ ...d, quick: q.code }))} />
          ))}
        </View>

        <Text style={styles.label}>Tadbir turi</Text>
        <View style={styles.row}>
          {EVENTS.map((e) => (
            <Chip
              key={e.code}
              label={e.label}
              selected={draft.event_type === e.code}
              onPress={() => setDraft((d) => ({ ...d, event_type: d.event_type === e.code ? undefined : e.code }))}
            />
          ))}
        </View>

        <Text style={styles.label}>Radius</Text>
        <View style={styles.row}>
          {RADII.map((r) => (
            <Chip key={r} label={`${r} km`} selected={draft.radiusKm === r} onPress={() => setDraft((d) => ({ ...d, radiusKm: r }))} />
          ))}
        </View>

        <Text style={styles.label}>Saralash</Text>
        <View style={styles.row}>
          {SORTS.map((s) => (
            <Chip key={s.code} label={s.label} selected={draft.sort === s.code} onPress={() => setDraft((d) => ({ ...d, sort: s.code }))} />
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            title="Tozalash"
            variant="outline"
            style={{ flex: 1 }}
            onPress={() => setDraft({ quick: 'all', event_type: undefined, sort: 'distance', radiusKm: 20 })}
          />
          <Button title="Ko‘rsatish" style={{ flex: 2 }} onPress={() => onApply(draft)} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: spacing[4], paddingTop: spacing[3] },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: spacing[3] },
  title: { ...typography.h3, color: colors.text, marginBottom: spacing[2] },
  label: { ...typography.bodySemiBold, color: colors.text, marginTop: spacing[4], marginBottom: spacing[2] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  actions: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[6] },
});
