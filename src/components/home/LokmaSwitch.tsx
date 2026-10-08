import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, fontFamily, layout } from '../../theme';
import { showLokmaSwitch, useLokma } from '../../lib/lokma';

/*
 * Lokma bo'limlariga qaytish: Lokma Go (taomlar) va Lokma Market (do'konlar).
 * Ko'rinishi Lokma Go bosh sahifasidagi bo'lim tugmalari bilan bir xil
 * (rasm + nom + izoh) — mijoz alohida sayt ekanini sezmasin.
 * Lokma ichida — ota ilovaga xabar (sahifa yangilanmaydi); oddiy saytda — havola.
 */
const IMG_GO = require('../../../assets/lokma/lokma-go.webp');
const IMG_MARKET = require('../../../assets/lokma/market-basket.webp');

function Tile({ img, title, sub, tone, onPress }: { img: number; title: string; sub: string; tone: 'go' | 'market'; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.tile, tone === 'go' ? styles.go : styles.market, pressed && styles.pressed]}
    >
      <Image source={img} style={styles.img} resizeMode="contain" accessibilityIgnoresInvertColors />
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.sub} numberOfLines={1}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

export function LokmaSwitch() {
  const { goToLokma } = useLokma();
  if (!showLokmaSwitch) return null;
  return (
    <View style={styles.row}>
      <Tile img={IMG_GO} title="Lokma Go" sub="Restoran va taomlar" tone="go" onPress={() => goToLokma('/')} />
      <Tile img={IMG_MARKET} title="Lokma Market" sub="Oziq-ovqat do‘konlari" tone="market" onPress={() => goToLokma('/market')} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing[2], paddingHorizontal: layout.screenPadding, paddingTop: spacing[4], paddingBottom: spacing[1] },
  tile: {
    flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 18, borderWidth: 1, paddingVertical: 8, paddingLeft: 6, paddingRight: 8, minHeight: 64,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
  },
  go: { backgroundColor: '#FFF4E8', borderColor: '#FFD2A6' },
  market: { backgroundColor: '#E9F8EF', borderColor: '#BFE8CF' },
  pressed: { transform: [{ scale: 0.97 }] },
  img: { width: 46, height: 46 },
  text: { flex: 1, minWidth: 0 },
  title: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, fontSize: 14, color: colors.text },
  sub: { ...typography.caption, fontSize: 11, color: colors.textSecondary, marginTop: 1 },
});
