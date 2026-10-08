import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, fontFamily } from '../../theme';
import { useLocation } from '../../store/location';
import { useLokma } from '../../lib/lokma';
import { REGIONS } from '../../lib/regions';

/*
 * "Qayerdagi to'yxonalar?" — Lokma'dagi manzillar, joriy joylashuv,
 * boshqa hudud (masalan, tug'ilgan joy) yoki butun O'zbekiston.
 */
export function LocationSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const loc = useLocation();
  const lokma = useLokma();
  const addresses = lokma.addresses.filter((a) => a.lat != null && a.lng != null);
  const pick = (fn: () => void) => { fn(); onClose(); };
  const on = (kind: string, id?: string) => loc.place.kind === kind && (id === undefined || loc.place.id === id);

  const Row = ({ icon, title, sub, active, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; sub?: string; active: boolean; onPress: () => void }) => (
    <Pressable onPress={onPress} style={[styles.row, active && styles.rowActive]} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <View style={[styles.icon, active && { backgroundColor: colors.primary }]}>
        <Ionicons name={icon} size={18} color={active ? colors.white : colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
        {!!sub && <Text style={styles.rowSub} numberOfLines={1}>{sub}</Text>}
      </View>
      {active && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.h}>Qayerdagi to‘yxonalar?</Text>
        <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ paddingBottom: spacing[6] }}>
          {addresses.length > 0 && <Text style={styles.group}>Mening manzillarim</Text>}
          {addresses.map((a) => (
            <Row key={a.id} icon="home-outline" title={a.title || a.address || 'Manzil'} sub={a.title ? a.address : a.city}
              active={on('address', a.id)} onPress={() => pick(() => loc.setPlace({ kind: 'address', address: a }))} />
          ))}
          <Row icon="navigate-outline" title="Joriy joylashuv" sub="Telefon GPS orqali" active={on('gps')} onPress={() => pick(() => loc.setPlace({ kind: 'gps' }))} />
          <Row icon="globe-outline" title="Butun O‘zbekiston" sub="Barcha to‘yxonalar" active={on('all')} onPress={() => pick(() => loc.setPlace({ kind: 'all' }))} />

          <Text style={styles.group}>Boshqa hudud (masalan, tug‘ilgan joyingiz)</Text>
          {REGIONS.map((r) => (
            <Row key={r.id} icon="location-outline" title={r.name} sub={`${r.radiusKm} km atrofida`}
              active={on('region', r.id)} onPress={() => pick(() => loc.setPlace({ kind: 'region', region: r }))} />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: spacing[4], paddingTop: spacing[2] },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing[3] },
  h: { ...typography.h3, fontFamily: fontFamily.extraBold, color: colors.text, marginBottom: spacing[2] },
  group: { ...typography.caption, fontSize: 12, color: colors.textSecondary, marginTop: spacing[3], marginBottom: spacing[1], textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 14 },
  rowActive: { backgroundColor: colors.primaryLight },
  icon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { ...typography.bodySemiBold, color: colors.text },
  rowSub: { ...typography.caption, fontSize: 12, color: colors.textSecondary, marginTop: 1 },
});
