import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, spacing, typography, fontFamily } from '../../theme';
import type { Vendor } from '../../types';
import { formatSum } from '../../lib/format';

const TINTS = ['#E4ECFB', '#FBE6EC', '#E3F3EA', '#FFF1D6'];

export function VendorSlider({ title, vendors, selectedId, onToggle, icon }: {
  title: string;
  vendors: Vendor[];
  selectedId: string | null;
  onToggle: (id: string) => void;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  if (!vendors.length) return null;
  return (
    <View style={{ gap: spacing[3] }}>
      <View style={styles.head}>
        <Text style={styles.h}>{title}</Text>
        <Text style={styles.hint}>ixtiyoriy · 1 tasini tanlang</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: layout.screenPadding }} style={{ marginHorizontal: -layout.screenPadding }}>
        {vendors.map((v, i) => {
          const on = v.id === selectedId;
          return (
            <Pressable
              key={v.id}
              onPress={() => onToggle(v.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              style={[styles.card, on && styles.cardOn]}
            >
              <View style={[styles.media, { backgroundColor: TINTS[i % TINTS.length] }]}>
                <Ionicons name={icon} size={36} color={on ? colors.primary : colors.mapButton} />
              </View>
              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={1}>{v.name}</Text>
                <Text style={styles.desc} numberOfLines={1}>{v.description}</Text>
                <View style={styles.bottom}>
                  <Text style={styles.price}>{formatSum(v.price)}</Text>
                  <View style={[styles.btn, on && styles.btnOn]}>
                    <Text style={[styles.btnText, on && { color: colors.white }]}>{on ? '✓ Tanlandi' : 'Tanlash'}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  h: { ...typography.h3, fontFamily: fontFamily.extraBold, color: colors.text },
  hint: { ...typography.caption, fontSize: 12, color: colors.textSecondary },
  card: { width: 230, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.white },
  cardOn: { borderWidth: 2, borderColor: colors.primary },
  media: { height: 104, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 14, gap: 3 },
  name: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, color: colors.text },
  desc: { ...typography.caption, fontSize: 12, color: colors.textSecondary },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 6 },
  price: { ...typography.captionMedium, fontFamily: fontFamily.extraBold, color: colors.text, flexShrink: 1 },
  btn: { backgroundColor: colors.background, borderRadius: 15, paddingHorizontal: 10, paddingVertical: 6 },
  btnOn: { backgroundColor: colors.primary },
  btnText: { ...typography.captionMedium, fontSize: 12, color: colors.text },
});
