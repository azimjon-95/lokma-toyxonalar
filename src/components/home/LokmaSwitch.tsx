import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, fontFamily, layout } from '../../theme';
import { showLokmaSwitch, useLokma } from '../../lib/lokma';

/*
 * Lokma bo'limlariga qaytish: Lokma Go (taomlar) va Lokma Market (do'konlar).
 * Lokma ichida — ota ilovaga xabar (sahifa yangilanmaydi); oddiy saytda — havola.
 */
export function LokmaSwitch() {
  const { goToLokma } = useLokma();
  if (!showLokmaSwitch) return null;
  return (
    <View style={styles.row}>
      <Pressable onPress={() => goToLokma('/')} style={[styles.btn, styles.go]} accessibilityRole="button" accessibilityLabel="Lokma Go">
        <Ionicons name="restaurant" size={18} color="#C2410C" />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Lokma Go</Text>
          <Text style={styles.sub} numberOfLines={1}>Restoran va taomlar</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </Pressable>
      <Pressable onPress={() => goToLokma('/market')} style={[styles.btn, styles.market]} accessibilityRole="button" accessibilityLabel="Lokma Market">
        <Ionicons name="basket" size={18} color="#17834A" />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Lokma Market</Text>
          <Text style={styles.sub} numberOfLines={1}>Oziq-ovqat do‘konlari</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing[2], paddingHorizontal: layout.screenPadding, paddingBottom: spacing[3] },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, minHeight: 56 },
  go: { backgroundColor: '#FFF4E8', borderColor: '#FFD2A6' },
  market: { backgroundColor: '#E9F8EF', borderColor: '#BFE8CF' },
  title: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, fontSize: 14, color: colors.text },
  sub: { ...typography.caption, fontSize: 11, color: colors.textSecondary },
});
